import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Title } from "@tremor/react";
import {
  Plus,
  BadgeIndianRupee,
  ArrowUpFromLine,
  ArrowDownFromLine,
  BadgePercent,
  Loader2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CompanyTable from "../components/CompanyTable";
import { useAuth } from "../context/auth-context";

import { toast } from "react-toastify";
import ChartPopup from "../components/ChartPopup";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formatCurrency, months } from "./company-analysis";

const calculateFinancials = (item) => {
  const totalExpenditure =
    item.CRM +
    item.expenses +
    item.other_expenses +
    item.salary +
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
    key: "salary",
    label: "Salary",
    color: "text-fuchsia-700",
  },
  {
    key: "expenses",
    label: "Expenses",
    color: "text-yellow-600",
  },
  {
    key: "other_expenses",
    label: "Other Expenses",
    color: "text-pink-600",
  },
  { key: "target", label: "Target", color: "text-purple-600" },
  { key: "total_sale", label: "Sale", color: "text-red-600" },
  { key: "CRM", label: "CRM", color: "text-indigo-600" },
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

const EmployeeAnalysis = () => {
  const { companyId, managerId, regionId, employeeId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [newMonthlyData, setNewMonthlyData] = useState({
    salary: "",
    expenses: "",
    target: "",
    sale: "",
    CRM: "",
    other_expenses: "",
    total_manufacturing_cost: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeDataOverall, setEmployeeDataOverall] = useState({});
  const [company, setCompany] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based (Jan = 1)
  const defaultYear = currentMonth < 4 ? currentYear - 1 : currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [manager, setManager] = useState(null);
  const [region, setRegion] = useState(null);
  const [isChartPopupOpen, setIsChartPopupOpen] = useState(false);
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({});
  const [phase, setphase] = useState("");
  const companies = useSelector((state) => state.companies.value);
  const employees = useSelector((state) => state.company_analysis.employees);
  const managers = useSelector((state) => state.company_analysis.managers);
  const regions = useSelector((state) => state.company_analysis.regions);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEmployeeData = async (
    startMonth,
    startYear,
    endMonth,
    endYear
  ) => {
    try {
      const res1 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/employees/analysis/monthwise/${employeeId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );
      const res2 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/employees/analysis/overall/${employeeId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );

      console.log(res1, res2);

      const updatedEmployeeData = res1.data.monthlyData.map((item) => ({
        ...item,
        month: months[item.month],
        ...calculateFinancials(item), // Adds totalExpenditure, profit, and profitPercentage
      }));

      const updatedEmployeeDataOverall = {
        month: "Total",
        ...res2.data,
        ...calculateFinancials(res2.data),
      };

      console.log("updatedEmployeeData", updatedEmployeeData);
      console.log("updatedEmployeeDataOverall", updatedEmployeeDataOverall);
      setEmployeeData(updatedEmployeeData);
      setEmployeeDataOverall(updatedEmployeeDataOverall);
    } catch (error) {
      console.log(error);
      if (error.response.status == 404) {
        console.log("Data not found");
        if (defaultYear != selectedYear)
          toast.error(error.response.data.message);
        setSelectedYear(defaultYear);
      }
    }
  };

  const fetchAllTimeEmployeeData = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/employees/analysis/monthwise/${employeeId}/${2022}/${4}/${2026}/${3}`,
        { withCredentials: true }
      );
      console.log("overall data", res);

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
    } catch (error) {}
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
    const foundEmployee = employees.find((e) => e.id === employeeId);
    if (!foundEmployee) {
      navigate("/analysis");
      return;
    }
    setEmployee(foundEmployee);

    const foundCompany = companies.find((c) => c.id === companyId);

    if (!foundCompany) {
      navigate("/analysis");
      return;
    }
    setCompany(foundCompany);
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

    fetchEmployeeData(startMonth, startYear, endMonth, endYear);
  }, [
    isAuthenticated,
    navigate,
    selectedYear,
    currentYear,
    currentMonth,
    employeeId,
  ]);

  const handleChartClick = async (phase) => {
    if (phase == "session") {
      setChartData(employeeData);
      setphase("session");
    } else if (phase == "overall") {
      await fetchAllTimeEmployeeData();
      setphase("overall");
    }
    setIsChartPopupOpen(true);
  };

  const handleNewMonthlyDataChange = (field, value) => {
    setNewMonthlyData((prev) => ({ ...prev, [field]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewMonthlyDataSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading
    console.log("New monthly data:", newMonthlyData);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/employees/salary`,
        {
          ...newMonthlyData,
          employeeId,
          managerId,
        },
        { withCredentials: true }
      );
      console.log(res);

      fetchEmployeeData(startMonth, startYear, endMonth, endYear);

      setNewMonthlyData({
        salary: "",
        expenses: "",
        target: "",
        sale: "",
        CRM: "",
        other_expenses: "",
        total_manufacturing_cost: "",
        month: "",
        year: new Date().getFullYear().toString(),
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };



    const editingRow=(data)=>{
      setIsDialogOpen(true)
      const modifiedData= {
        month: editMonthMapping[data.month],
        CRM: data.CRM,
        salary: data.salary,
        expenses: data.expenses,
        other_expenses:data.other_expenses,
        target: data.target,
        profit: data.profit,
        year: data.year,
        sale: data.total_sale,
        total_manufacturing_cost:data.total_manufacturing_cost,
      }
      console.log(modifiedData);
      setNewMonthlyData(modifiedData)
    }





  if (!employee) return <div>Loading...</div>;

  return (
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
              src={employee.image}
              alt={employee.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{employee.name}</h1>
              <p className="text-gray-600">{employee.employeeId}</p>
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
                  {formatCurrency(employeeDataOverall.total_sale || 0)}
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
                  {formatCurrency(employeeDataOverall.totalExpenditure || 0)}
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
                  {formatCurrency(employeeDataOverall.profit || 0)}
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
                  {employeeDataOverall.profitPercentage || 0}%
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
            {employeeData.length > 0 &&
              Object.keys(employeeDataOverall).length > 0 && (
                <CompanyTable
                  filename={`${employee.name}_${region.name}_${manager.name}_${
                    company.name
                  }_${selectedYear}-${selectedYear + 1}`}
                  data={[...employeeData, employeeDataOverall]}
                  selectedYear={selectedYear}
                  columns={columns}
                  editingRow={editingRow}
                />
              )}
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Monthly Record
              </Button>
            </DialogTrigger>
            <DialogContent
              forceMount
              className="max-w-[70%] bg-white p-6 sm:p-8"
            >
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  Add Monthly Employee Performance Data
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Enter Employee's Monthly Records.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewMonthlyDataSubmit} className="space-y-4">
                {/* Month & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                    value={NumToMonth[newMonthlyData.month]}
                      onValueChange={(value) =>{
                        setSelectedMonth(value)
                        handleNewMonthlyDataChange("month", monthMapping[value])

                      }
                      }
                      required
                    >
                      <SelectTrigger id="month" className="w-full">
                        <SelectValue  placeholder="Select month" />
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
                    { id: "target", label: "Target" },
                    { id: "sale", label: "Total Sale" },
                    { id: "CRM", label: "CRM" },
                    { id: "other_expenses", label: "Other Expenses" },
                    {
                      id: "total_manufacturing_cost",
                      label: "Total Manufacturing Cost",
                    },
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
                    "Add Employee Record"
                  )}
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

export const monthMapping = {
  January: "1",
  February: "2",
  March: "3",
  April: "4",
  May: "5",
  June: "6",
  July: "7",
  August: "8",
  September: "9",
  October: "10",
  November: "11",
  December: "12",
};

export const NumToMonth = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};


export const editMonthMapping = {
  "Jan": "1",
  "Feb": "2",
  "Mar": "3",
  "Apr": "4",
  "May": "5",
  "Jun": "6",
  "Jul": "7",
  "Aug": "8",
  "Sept": "9",
  "Oct": "10",
  "Nov": "11",
  "Dec": "12",
}
export default EmployeeAnalysis;
