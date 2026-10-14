export type Department = "Administration" | "ICT" | "Finance"
export type Office = "HQ - Abuja" | "Zone B Office" | "Zone C Office"

export type ApprovalRequest = {
  id: string
  name: string
  staffId: string
  initials: string
  avatar: "green" | "gray" | "photo"
  photo?: string
  department: Department
  office: Office
  registeredOn: string
  registeredAt: string
}

export const departmentTone: Record<Department, string> = {
  Administration: "bg-rose-400",
  ICT: "bg-teal-500",
  Finance: "bg-emerald-500",
}

export const approvalQueue: ApprovalRequest[] = [
  {
    id: "1",
    name: "Chinelo Okoro",
    staffId: "NYSC/STF/042",
    initials: "CO",
    avatar: "green",
    department: "Administration",
    office: "HQ - Abuja",
    registeredOn: "Oct 24, 2023",
    registeredAt: "09:41 AM",
  },
  {
    id: "2",
    name: "Babatunde Yusuf",
    staffId: "NYSC/STF/089",
    initials: "BY",
    avatar: "photo",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96",
    department: "ICT",
    office: "HQ - Abuja",
    registeredOn: "Oct 24, 2023",
    registeredAt: "11:15 AM",
  },
  {
    id: "3",
    name: "Fatimah Ahmed",
    staffId: "NYSC/STF/112",
    initials: "FA",
    avatar: "gray",
    department: "Finance",
    office: "Zone B Office",
    registeredOn: "Oct 23, 2023",
    registeredAt: "02:30 PM",
  },
  {
    id: "4",
    name: "Grace Nnaji",
    staffId: "NYSC/STF/145",
    initials: "GN",
    avatar: "photo",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=96&h=96",
    department: "Administration",
    office: "Zone C Office",
    registeredOn: "Oct 23, 2023",
    registeredAt: "04:05 PM",
  },
  {
    id: "5",
    name: "Emmanuel Danjuma",
    staffId: "NYSC/STF/156",
    initials: "ED",
    avatar: "green",
    department: "ICT",
    office: "HQ - Abuja",
    registeredOn: "Oct 22, 2023",
    registeredAt: "08:15 AM",
  },
  {
    id: "6",
    name: "Amina Bello",
    staffId: "NYSC/STF/061",
    initials: "AB",
    avatar: "gray",
    department: "Administration",
    office: "HQ - Abuja",
    registeredOn: "Oct 22, 2023",
    registeredAt: "10:02 AM",
  },
  {
    id: "7",
    name: "Chidi Nwachukwu",
    staffId: "NYSC/STF/178",
    initials: "CN",
    avatar: "green",
    department: "Finance",
    office: "Zone B Office",
    registeredOn: "Oct 21, 2023",
    registeredAt: "01:18 PM",
  },
  {
    id: "8",
    name: "Oluwaseun Adebayo",
    staffId: "NYSC/STF/001",
    initials: "OA",
    avatar: "green",
    department: "ICT",
    office: "Zone C Office",
    registeredOn: "Oct 21, 2023",
    registeredAt: "09:05 AM",
  },
  {
    id: "9",
    name: "Halima Suleiman",
    staffId: "NYSC/STF/173",
    initials: "HS",
    avatar: "gray",
    department: "Finance",
    office: "HQ - Abuja",
    registeredOn: "Oct 20, 2023",
    registeredAt: "03:44 PM",
  },
  {
    id: "10",
    name: "Ifeanyi Obi",
    staffId: "NYSC/STF/188",
    initials: "IO",
    avatar: "green",
    department: "Administration",
    office: "Zone B Office",
    registeredOn: "Oct 20, 2023",
    registeredAt: "11:27 AM",
  },
  {
    id: "11",
    name: "Ngozi Eze",
    staffId: "NYSC/STF/194",
    initials: "NE",
    avatar: "gray",
    department: "ICT",
    office: "HQ - Abuja",
    registeredOn: "Oct 19, 2023",
    registeredAt: "08:50 AM",
  },
  {
    id: "12",
    name: "Tunde Balogun",
    staffId: "NYSC/STF/201",
    initials: "TB",
    avatar: "green",
    department: "Finance",
    office: "Zone C Office",
    registeredOn: "Oct 19, 2023",
    registeredAt: "04:12 PM",
  },
]
