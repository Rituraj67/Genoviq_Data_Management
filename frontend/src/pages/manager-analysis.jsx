import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Title } from "@tremor/react";
import { MapPinned, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  ChevronRight,
  ArrowUpFromLine,
  ArrowDownFromLine,
  BadgePercent,
  BadgeIndianRupee,
} from "lucide-react";
import CompanyTable from "../components/CompanyTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "../context/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formatCurrency, months } from "./company-analysis";
import ChartPopup from "../components/ChartPopup";
import {
  addRegion,
  clearRegions,
  setRegions,
} from "../redux/companyAnalysisSlice";
import { toast } from "react-toastify";
import { monthMapping } from "./employee-analysis";

const calculateFinancials = (item) => {
  const totalExpenditure =
    item.total_crm +
    item.total_employee_expenses +
    item.total_employee_other_expenses +
    item.total_employee_salary +
    item.manager_expenses +
    item.manager_salary +
    item.total_manufacturing_cost;

  const profit = item.total_sale - totalExpenditure;

  const profitPercentage =
    totalExpenditure !== 0
      ? parseFloat(((profit / totalExpenditure) * 100).toFixed(2))
      : 0;

  return { totalExpenditure, profit, profitPercentage };
};

const columns = [
  {
    key: "month",
    label: "Month",
    color: "font-semibold text-lg font-ubuntu",
  },
  {
    key: "manager_salary",
    label: "Manager Salary",
    color: "text-blue-600",
  },
  {
    key: "manager_expenses",
    label: "Managers Expenses",
    color: "text-green-600",
  },
  {
    key: "total_employee_salary",
    label: "Employee Salary",
    color: "text-fuchsia-700",
  },
  {
    key: "total_employee_expenses",
    label: "Employee Expenses",
    color: "text-yellow-600",
  },
  {
    key: "total_employee_other_expenses",
    label: "Employee Other Expenses",
    color: "text-pink-600",
  },
  { key: "total_target", label: "Target", color: "text-purple-600" },
  { key: "total_sale", label: "Sale", color: "text-red-600" },
  { key: "total_crm", label: "CRM", color: "text-indigo-600" },
  {
    key: "total_manufacturing_cost",
    label: "Mfg Cost",
    color: "text-teal-600",
  },
  {
    key: "totalExpenditure",
    label: "Total Expenditure",
    color: "text-orange-600",
  },
  { key: "profit", label: "Profit", color: "text-lime-600" },
  { key: "profitPercentage", label: "Profit%", color: "text-amber-600" },
];

const ManagerAnalysis = () => {
  const { companyId, managerId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [newRegion, setNewRegion] = useState({ name: "" });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based (Jan = 1)
  const defaultYear = currentMonth < 4 ? currentYear - 1 : currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [manager, setManager] = useState(null);
  const [managerData, setManagerData] = useState([]);
  const [managerDataOverall, setManagerDataOverall] = useState({});
  const [isChartPopupOpen, setIsChartPopupOpen] = useState(false);
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({});
  const [phase, setphase] = useState("");
  const companies = useSelector((state) => state.companies.value);

  const regions = useSelector((state) => state.company_analysis.regions);
  const managers = useSelector((state) => state.company_analysis.managers);

  const getRegions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/regions/${managerId}`,
        { withCredentials: true }
      );
      console.log("regions", res);
      dispatch(setRegions(res.data));
    } catch (error) {}
  };

  const fetchManagerData = async (startMonth, startYear, endMonth, endYear) => {
    try {
      const res1 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/managers/analysis/monthwise/${managerId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );
      const res2 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/managers/analysis/overall/${managerId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );

      console.log(res1, res2);

      const updatedManagerData = res1.data.monthlyData.map((item) => ({
        ...item,
        month: months[item.month],
        ...calculateFinancials(item), // Adds totalExpenditure, profit, and profitPercentage
      }));

      const updatedManagerDataOverall = {
        ...res2.data,
        ...calculateFinancials(res2.data),
      };

      console.log(updatedManagerData);
      console.log(updatedManagerDataOverall);

      setManagerData(updatedManagerData);
      setManagerDataOverall(updatedManagerDataOverall);
    } catch (error) {
      console.log(error);
      if (error.response.status == 404) {
        console.log("Data not found");
        if (defaultYear != selectedYear) toast.error(error.response.data.error);
        setSelectedYear(defaultYear);
      }
    }
  };

  let startYear, startMonth, endYear, endMonth;

  if (
    selectedYear === currentYear ||
    (selectedYear == currentYear - 1 && currentMonth < 4)
  ) {
    startYear = selectedYear;
    startMonth = 4;
    endYear = currentYear;
    endMonth = currentMonth;
  } else {
    startYear = selectedYear;
    startMonth = 4;
    endYear = selectedYear + 1;
    endMonth = 3;
  }
  console.log(startMonth, startYear, endMonth, endYear);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    const foundManager = managers.find((c) => c.id === managerId);

    if (!foundManager) {
      navigate("/analysis");
      return;
    }
    setManager(foundManager);

    const foundCompany = companies.find((c) => c.id === companyId);

    if (!foundCompany) {
      navigate("/analysis");
      return;
    }
    setCompany(foundCompany);

    dispatch(clearRegions());

    // Fetch manager data here
    fetchManagerData(startMonth, startYear, endMonth, endYear);

    getRegions();
  }, [
    isAuthenticated,
    navigate,
    selectedYear,
    currentYear,
    currentMonth,
    managerId,
  ]); // Removed unnecessary dependencies

  const fetchAllTimeManagerData = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/managers/analysis/monthwise/${managerId}/${2022}/${4}/${2026}/${3}`,
        { withCredentials: true }
      );

      const updatedCharData = res.data.monthlyData.map((item) => {
        const monthName = `${months[item.month]}-${item.year}`;

        return {
          ...item,
          month: monthName, // Replace month number with name
          ...calculateFinancials(item),
        };
      });
      console.log(updatedCharData);
      setChartData(updatedCharData);
      console.log("overall data", res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChartClick = async (phase) => {
    if (phase == "session") {
      setChartData(managerData);
      setphase("session");
    } else if (phase == "overall") {
      await fetchAllTimeManagerData();
      setphase("overall");
    }
    setIsChartPopupOpen(true);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/regions`,
        {
          ...newRegion,
          managerId,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res);
      dispatch(addRegion(res.data));
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [newMonthlyData, setNewMonthlyData] = useState({
    salary: "",
    expenses: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const [managerDialog, setManagerDialog] = useState(false);
  const handleNewMonthlyDataChange = (field, value) => {
    setNewMonthlyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewMonthlyDataSubmit = async (e) => {
    e.preventDefault();
    console.log("New monthly data:", newMonthlyData);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/managers/salary`,
        {
          ...newMonthlyData,
          managerId,
        },
        { withCredentials: true }
      );
      console.log(res);
      setManagerDialog(false);

      fetchManagerData(startMonth, startYear, endMonth, endYear);

      setNewMonthlyData({
        salary: "",
        expenses: "",
        month: "",
        year: new Date().getFullYear().toString(),
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (!manager) return null;

  return (
    <>
      <div className="min-h-screen pt-32 px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                src={manager.image || "/placeholder.svg"}
                alt={manager.name}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{manager.name}</h1>
                <p className="text-gray-600">Regional Manager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card decoration="top" decorationColor="blue">
                  <Title className="flex items-center gap-2 text-blue-500">
                    <BadgeIndianRupee className="h-5 w-5" />
                    Revenue
                  </Title>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(managerDataOverall.total_sale || 0)}
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card decoration="top" decorationColor="red">
                  <Title className="flex items-center gap-2  text-red-500">
                    <ArrowUpFromLine className="h-5 w-5" />
                    Expenditure
                  </Title>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(managerDataOverall.totalExpenditure || 0)}
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card decoration="top" decorationColor="green">
                  <Title className="flex items-center gap-2  text-green-500">
                    <ArrowDownFromLine className="h-5 w-5" />
                    Profit
                  </Title>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(managerDataOverall.profit || 0)}
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card decoration="top" decorationColor="purple">
                  <Title className="flex items-center gap-2  text-purple-500">
                    <BadgePercent className="h-5 w-5" />
                    Profit%
                  </Title>
                  <p className="text-2xl font-semibold">
                    {managerDataOverall.profitPercentage || 0}%
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* Year Selection */}
            <div className="mb-4 grid grid-cols-[5fr_1fr]">
              <label className="font-semibold text-lg">
                Select Financial Year:
              </label>
              <Select
                className="w-24"
                value={selectedYear.toString()}
                onValueChange={(value) =>
                  setSelectedYear(Number.parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a year">
                    {selectedYear} - {selectedYear + 1}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
                  {Array.from({ length: currentYear - 2023 }).map((_, i) => {
                    const year = 2024 + i;
                    const isCurrentYear = year === currentYear;
                    const shouldShow = isCurrentYear ? currentMonth >= 4 : true;
                    return (
                      shouldShow && (
                        <SelectItem key={year} value={year.toString()}>
                          {year} - {year + 1}
                        </SelectItem>
                      )
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Card className="mb-6">
              <CompanyTable filename={`${manager.name}_${company.name}_${selectedYear}-${selectedYear+1}`} data={managerData} selectedYear={selectedYear}  columns={columns} />
            </Card>

            {/* add or update monthly data */}
            <Dialog open={managerDialog} onOpenChange={setManagerDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add/Update Monthly Data
                </Button>
              </DialogTrigger>
              <DialogContent
                forceMount
                className="max-w-[70%] bg-white p-6 sm:p-8"
              >
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    Add/Update Managers's Data
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Enter manager's data `(salary, expenses)`
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleNewMonthlyDataSubmit}
                  className="space-y-4"
                >
                  {/* Month & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select
                        onValueChange={(value) =>
                          handleNewMonthlyDataChange(
                            "month",
                            monthMapping[value]
                          )
                        }
                        required
                      >
                        <SelectTrigger id="month" className="w-full">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {Object.entries(monthMapping).map(
                            ([monthName, monthNumber]) => (
                              <SelectItem key={monthNumber} value={monthName}>
                                {monthName}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newMonthlyData.year}
                        onChange={(e) =>
                          handleNewMonthlyDataChange("year", e.target.value)
                        }
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Other Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 overflow-auto">
                    {[
                      { id: "salary", label: "Salary" },
                      { id: "expenses", label: "Expenses" },
                    ].map(({ id, label }) => (
                      <div key={id} className="space-y-2">
                        <Label htmlFor={id}>{label}</Label>
                        <Input
                          id={id}
                          type="number"
                          value={newMonthlyData[id]}
                          onChange={(e) =>
                            handleNewMonthlyDataChange(id, e.target.value)
                          }
                          required
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full sm:w-auto">
                    Add/Update Manager Record
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Chart session Buttons */}
            <Card className="my-6">
              <Title className="mb-4">Visual Representation</Title>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                <Button
                  onClick={() => handleChartClick("session")}
                  variant="outline"
                >
                  {selectedYear}-{selectedYear + 1}
                </Button>
                <Button
                  onClick={() => handleChartClick("overall")}
                  variant="outline"
                >
                  Overall
                </Button>
              </div>
            </Card>

            <Card>
              <div className="flex  items-center justify-between mb-4">
                <Title className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5" />
                  Managed Regions
                </Title>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add a Region
                    </Button>
                  </DialogTrigger>
                  <DialogContent className=" bg-white">
                    <DialogHeader>
                      <DialogTitle>Add New Region</DialogTitle>
                      <DialogDescription>
                        Enter the name of new Region.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <img
                          src={company.logo || "/placeholder.svg"}
                          alt={company.name}
                          className="h-28"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newRegion.name}
                          onChange={(e) =>
                            setNewRegion((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-slate-400">
                        Add Region
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <motion.div layout className="space-y-2">
                {regions.map((city) => (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <Link
                      to={`/analysis/${companyId}/${managerId}/${city.id}`}
                      className="text-blue-500 hover:text-blue-600 flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-gray-500">{city.state}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </div>
        </motion.div>

        <ChartPopup
          isOpen={isChartPopupOpen}
          onClose={() => setIsChartPopupOpen(false)}
          data={chartData}
          selectedYear={selectedYear}
          phase={phase}
        />
      </div>
    </>
  );
};

export default ManagerAnalysis;
