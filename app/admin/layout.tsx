import { Metadata } from "next";
import AdminClientLayout from "./clientLayout";

export const metadata: Metadata = {
  title: "Admin Dashboard | StudyBridge",
  description: "Admin dashboard for managing StudyBridge platform",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminClientLayout>
      {children}
    </AdminClientLayout>
  );
} 