import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, Title } from "@tremor/react";
import { useAuth } from "../context/auth-context";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  BadgeIndianRupee,
  BadgePercent,
  Loader2,
  Plus,
  Users,
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
import CompanyTable from "../components/CompanyTable";
import ChartPopup from "../components/ChartPopup";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addManager,
  clearManagers,
  setManagers,
} from "../redux/companyAnalysisSlice";
import { toast } from "react-toastify";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const calculateFinancials = (item) => {
  const totalExpenditure =
    item.total_crm +
    item.total_employee_expenses +
    item.total_employee_other_expenses +
    item.total_employee_salary +
    item.total_manager_expenses +
    item.total_manager_salary +
    item.total_manufacturing_cost;

  const profit = item.total_sale - totalExpenditure;

  const profitPercentage =
    totalExpenditure !== 0
      ? parseFloat(((profit / totalExpenditure) * 100).toFixed(2))
      : 0;

  return { totalExpenditure, profit, profitPercentage };
};

export const months = [
  "Overall",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const columns = [
  {
    key: "month",
    label: "Month",
    color: "font-semibold text-lg font-ubuntu",
  },
  {
    key: "total_manager_salary",
    label: "Manager Salary",
    color: "text-blue-600",
  },
  {
    key: "total_manager_expenses",
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

export default function CompanyAnalysis() {
  const { companyId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [newManager, setNewManager] = useState({
    name: "",
    image: null,
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based (Jan = 1)

  const defaultYear = currentMonth < 4 ? currentYear - 1 : currentYear;

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [companyData, setCompanyData] = useState([]);
  const [companyDataOverall, setCompanyDataOverall] = useState({});

  const [isChartPopupOpen, setIsChartPopupOpen] = useState(false);
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({});
  const [phase, setphase] = useState("");
  const companies = useSelector((state) => state.companies.value);
  const managers = useSelector((state) => state.company_analysis.managers);

  const fetchCompanyData = async (startMonth, startYear, endMonth, endYear) => {
    try {
      const res1 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/companies/analysis/monthwise/${companyId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );
      const res2 = await axios.get(
        `${
          import.meta.env.VITE_BASE_ADDRESS
        }/companies/analysis/overall/${companyId}/${startYear}/${startMonth}/${endYear}/${endMonth}`,
        { withCredentials: true }
      );
      console.log(res1, res2);

      const updatedCompanyData = res1.data.monthlyData.map((item) => ({
        ...item,
        month: months[item.month],
        ...calculateFinancials(item), // Adds totalExpenditure, profit, and profitPercentage
      }));

      console.log(updatedCompanyData);

      const updatedCompanyDataOverall = {
        month: "Total",
        ...res2.data,
        ...calculateFinancials(res2.data),
      };
      console.log(updatedCompanyDataOverall);
     
      

      setCompanyData(updatedCompanyData);
      setCompanyDataOverall(updatedCompanyDataOverall);
    } catch (error) {
      console.log(error);
      if (error.response.status == 404) {
        console.log("Data not found");
        if (defaultYear != selectedYear) toast.error(error.response.data.error);
        setSelectedYear(defaultYear);
      }
    }
  };

  const getManagers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/managers/${companyId}`,
        { withCredentials: true }
      );
      console.log("managers", res);
      dispatch(setManagers(res.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
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
    dispatch(clearManagers());
    fetchCompanyData(startMonth, startYear, endMonth, endYear);
    getManagers();
  }, [
    selectedYear,
    companyId,
    isAuthenticated,
    navigate,
    currentYear,
    currentMonth,
  ]);

  const handleChartClick = async (phase) => {
    if (phase == "session") {
      setChartData(companyData);
      setphase("session");
    } else if (phase == "overall") {
      await fetchAllTimeCompanyData();
      setphase("overall");
    }
    setIsChartPopupOpen(true);
  };

  const fetchAllTimeCompanyData = async () => {
    const res = await axios.get(
      `${
        import.meta.env.VITE_BASE_ADDRESS
      }/companies/analysis/monthwise/${companyId}/${2022}/${4}/${2026}/${3}`,
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewManager((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading
    // Handle form submission here
    const formData = new FormData();
    formData.append("name", newManager.name);
    formData.append("ggcimage", newManager.image);
    formData.append("companyId", companyId);
    console.log("New manager:", formData);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/managers`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );
      console.log(res);
      dispatch(addManager(res.data));
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  if (!company) return null;

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Existing company header and stats */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={company.logo || "/placeholder.svg"}
              alt={company.name}
              className="h-16 w-16"
            />
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-gray-600">{}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card decoration="top" className="border-t-4 border-blue-500">
              <Title className="flex items-center gap-2 text-blue-500">
                <BadgeIndianRupee className="h-5 w-5" />
                Revenue
              </Title>
              <p className="text-2xl font-semibold">
                {formatCurrency(companyDataOverall.total_sale || 0)}
              </p>
            </Card>
            <Card decoration="top" decorationColor="red">
              <Title className="flex items-center gap-2 text-red-500 ">
                <ArrowUpFromLine className="h-5 w-5" />
                Expenditure
              </Title>
              <p className="text-2xl font-semibold">
                {formatCurrency(companyDataOverall.totalExpenditure || 0)}
              </p>
            </Card>
            <Card decoration="top" className="border-t-4 border-green-500">
              <Title className="flex items-center gap-2 text-green-500">
                <ArrowDownFromLine className="h-5 w-5" />
                Profit
              </Title>
              <p className="text-2xl font-semibold">
                {formatCurrency(companyDataOverall.profit || 0)}
              </p>
            </Card>
            <Card decoration="top" className="border-t-4 border-purple-500">
              <Title className="flex items-center gap-2 text-purple-500">
                <BadgePercent className="h-5 w-5" />
                Profit%
              </Title>
              <p className="text-2xl font-semibold">
                {companyDataOverall.profitPercentage || 0}%
              </p>
            </Card>
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

            {companyData.length > 0 && Object.keys(companyDataOverall).length > 0 &&<CompanyTable data={[...companyData, companyDataOverall]} columns={columns} filename={`${company.name}_${selectedYear}-${selectedYear+1}`} selectedYear={selectedYear}  />}
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

          {/* New Managers Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Managers
              </Title>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Manager</DialogTitle>
                    <DialogDescription>
                      Enter Manager's Details
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
                        value={newManager.name}
                        onChange={(e) =>
                          setNewManager((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
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
                        "Add Manager"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <motion.div className="space-y-4">
              {managers?.map((manager) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/analysis/${companyId}/${manager.id}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    <img
                      src={
                        manager.image || "/placeholder.svg?height=40&width=40"
                      }
                      alt={manager.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{manager.name}</span>
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
}
