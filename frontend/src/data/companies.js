export const generateFinancialData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()
  
    return months.map((month) => ({
      month: `${month} ${currentYear}`,
      totalSalary: Math.floor(Math.random() * 1000000) + 500000,
      managersExpenses: Math.floor(Math.random() * 200000) + 100000,
      expenses: Math.floor(Math.random() * 500000) + 200000,
      target: Math.floor(Math.random() * 2000000) + 1000000,
      sale: Math.floor(Math.random() * 2500000) + 1500000,
      crm: Math.floor(Math.random() * 100000) + 50000,
      otherExpenses: Math.floor(Math.random() * 300000) + 100000,
      mfgCost: Math.floor(Math.random() * 800000) + 400000,
      totalExpenditure: Math.floor(Math.random() * 3000000) + 2000000,
      netSale: Math.floor(Math.random() * 2000000) + 1000000,
      profit: Math.floor(Math.random() * 1000000) + 500000,
      profitPercentage: Math.floor(Math.random() * 30) + 10,
    }))
  }
  
  export const companies = [
    {
      id: 1,
      name: "Genoviq Pharmaceuticals",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Genoviq%20Group%20Of%20Companies-vJKa5TSqddSyTjmrj5GJp9blXvc38g.png",
      description: "Main pharmaceutical manufacturing and research division",
      stats: {
        revenue: "₹50M",
        products: 25,
        research: 12,
      },
      financialData: generateFinancialData(),
      managers: [
      {
        id: 1,
        name: "John Doe",
        salary:"5400",
        expeses:"6454",
        image: "/path/to/image.jpg",
        financialData: generateFinancialData(),
        stats: {
          teamSize: 15,
          projects: 8,
          states: 3,
        },
        cities: [
          { id: 1, name: "New York", state: "New York" },
          { id: 2, name: "Boston", state: "Massachusetts" },
        ],
        
      },
      {
        id: 2,
        name: "kalalaal ",
        image: "/path/to/image.jpg",
        stats: {
          teamSize: 15,
          projects: 8,
          states: 3,
        },
        cities: [
          { id: 1, name: "New York", state: "New York" },
          { id: 2, name: "Boston", state: "Massachusetts" },
        ],
        
      },
      // ... other managers
    ],
    },
    {
      id: 2,
      name: "Genoviq Biotech",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Genoviq%20Group%20Of%20Companies-vJKa5TSqddSyTjmrj5GJp9blXvc38g.png",
      description: "Biotechnology research and development wing",
      stats: {
        revenue: "₹30M",
        products: 15,
        research: 8,
      },
      financialData: generateFinancialData(),
    },
    {
      id: 3,
      name: "Genoviq Distribution",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Genoviq%20Group%20Of%20Companies-vJKa5TSqddSyTjmrj5GJp9blXvc38g.png",
      description: "Pharmaceutical distribution and logistics",
      stats: {
        revenue: "₹40M",
        products: 40,
        research: 5,
      },
      financialData: generateFinancialData(),
    },
  ]
  
  