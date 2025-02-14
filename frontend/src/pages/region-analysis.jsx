import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, DialogPanel, Title } from "@tremor/react";
import {
  Plus,
  BadgeIndianRupee,
  ArrowUpFromLine,
  ArrowDownFromLine,
  BadgePercent,
  Users,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CompanyTable from "../components/CompanyTable";
import { useAuth } from "../context/auth-context";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formatCurrency, months } from "./company-analysis";
import ChartPopup from "../components/ChartPopup";
import { toast } from "react-toastify";
import {
  addEmployee,
  clearEmployees,
  setEmployees,
} from "../redux/companyAnalysisSlice";

const columns = [
  {
    key: "month",
    label: "Month",
    color: "font-semibold text-lg font-ubuntu",
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

const calculateFinancials = (item) => {
  const totalExpenditure =
    item.total_crm +
    item.total_employee_expenses +
    item.total_employee_other_expenses +
    item.total_employee_salary +
    item.total_manufacturing_cost;

  const profit = item.total_sale - totalExpenditure;

  const profitPercentage =
    totalExpenditure !== 0
      ? parseFloat(((profit / totalExpenditure) * 100).toFixed(2))
      : 0;

  return { totalExpenditure, profit, profitPercentage };
};

const RegionAnalysis = () => {
  const { companyId, regionId, managerId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    employeeId: "",
    image: null,
  });
  const [region, setRegion] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [regionDataOverall, setRegionDataOverall] = useState({});

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based (Jan = 1)
  const defaultYear = currentMonth < 4 ? currentYear - 1 : currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const regions = useSelector((state) => state.company_analysis.regions);
  const companies = useSelector((state) => state.companies.value);
  const employees = useSelector((state) => state.company_analysis.employees);
  const managers = useSelector((state) => state.company_analysis.managers);


  const [isChartPopupOpen, setIsChartPopupOpen] = useState(false);
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({});
  const [phase, setphase] = useState("");
  const [manager, setManager] = useState(null)


  const fetchRegionData = async (startMonth, startYear, endMonth, endYear) => {
    try {
      const res1 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/regions/analysis/monthwise/${regionId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );
      const res2 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/regions/analysis/overall/${regionId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );

      console.log(res1, res2);

      const updatedRegionData = res1.data.monthlyData.map((item) => ({
        ...item,
        month: months[item.month],
        ...calculateFinancials(item), // Adds totalExpenditure, profit, and profitPercentage
      }));

      const updatedRegionDataOverall = {
        ...res2.data,
        ...calculateFinancials(res2.data),
      };

      console.log(updatedRegionData);
      console.log(updatedRegionDataOverall);

      setRegionData(updatedRegionData);
      setRegionDataOverall(updatedRegionDataOverall);
    } catch (error) {
      console.log(error);
      if (error.response.status == 404) {
        console.log("Data not found");
        if (defaultYear != selectedYear) toast.error(error.response.data.error);
        setSelectedYear(defaultYear);
      }
    }
  };

  const fetchAllTimeRegionData = async () => {
    const res = await axios.get(
      `${
        import.meta.env.VITE_BASE_ADDRESS
      }/regions/analysis/monthwise/${regionId}/${2022}/${4}/${2026}/${3}`,
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
  };

  const getAllEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/employees/${regionId}`,
        { withCredentials: true }
      );
      console.log(res);
      dispatch(setEmployees(res.data));
    } catch (error) {
      console.log(error);
    }
  };

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

    const foundRegion = regions.find((c) => c.id === regionId);

    if (!foundRegion) {
      navigate("/analysis");
      return;
    }

    setRegion(foundRegion);

    const foundCompany = companies.find((c) => c.id === companyId);

    if (!foundCompany) {
      navigate("/analysis");
      return;
    }
    setCompany(foundCompany);

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

    // Fetch region data here
    dispatch(clearEmployees());
    fetchRegionData(startMonth, startYear, endMonth, endYear);
    getAllEmployees();
  }, [
    isAuthenticated,
    navigate,
    selectedYear,
    currentYear,
    currentMonth,
    regionId,
  ]);

  const handleNewEmployeeChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChartClick = async (phase) => {
    if (phase == "session") {
      setChartData(regionData);
      setphase("session");
    } else if (phase == "overall") {
      await fetchAllTimeRegionData();
      setphase("overall");
    }
    setIsChartPopupOpen(true);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewEmployeeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const formData = new FormData();
    formData.append("name", newEmployee.name);
    formData.append("employeeId", newEmployee.employeeId);
    formData.append("ggcimage", newEmployee.image);
    formData.append("regionId", regionId);

    console.log("New employee data:", formData);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/employees`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );
      console.log(res);
      dispatch(addEmployee(res.data));
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
    setNewEmployee({
      name: "",
      employee_id: "",
    });
  };

  if (!region) return <div>Loading...</div>;

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6">
            {region.name} Region Analysis
          </h1>

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
                  {formatCurrency(regionDataOverall.total_sale || 0)}
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card decoration="top" decorationColor="red">
                <Title className="flex items-center gap-2 text-red-500">
                  <ArrowUpFromLine className="h-5 w-5" />
                  Expenditure
                </Title>
                <p className="text-2xl font-semibold">
                  {formatCurrency(regionDataOverall.totalExpenditure || 0)}
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card decoration="top" decorationColor="green">
                <Title className="flex items-center gap-2 text-green-500">
                  <ArrowDownFromLine className="h-5 w-5" />
                  Profit
                </Title>
                <p className="text-2xl font-semibold">
                  {formatCurrency(regionDataOverall.profit || 0)}
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card decoration="top" decorationColor="purple">
                <Title className="flex items-center gap-2 text-purple-500">
                  <BadgePercent className="h-5 w-5" />
                  Profit %
                </Title>
                <p className="text-2xl font-semibold">
                  {regionDataOverall.profitPercentage || 0}
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
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
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
            
            <CompanyTable filename={`${region.name}_${manager.name}_${company.name}_${selectedYear}-${selectedYear+1}`} data={regionData} columns={columns} selectedYear={selectedYear} />
          </Card>


          {/* Chart session Buttons */}
          <Card className="mb-6">
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
            <div className="flex justify-between items-center mb-4">
              <Title className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employees
              </Title>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Enter the details of new employee.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleNewEmployeeSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newEmployee.name}
                        onChange={handleNewEmployeeChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employeeId"
                        name="employeeId"
                        value={newEmployee.employeeId}
                        onChange={handleNewEmployeeChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Profile Picture</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-slate-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Employee"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <motion.div layout className="space-y-2">
              {employees.map((employee) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Link
                    to={`/analysis/${companyId}/${managerId}/${regionId}/${employee.id}`}
                    className="flex items-center gap-3 w-full"
                  >
                    <img
                      src={employee.image || "/placeholder.svg"}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <p className="font-medium">{employee.name}</p>
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
  );
};

export default RegionAnalysis;
