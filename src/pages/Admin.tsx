import WalkinBooking from "@/components/admin/WalkinBooking";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-heading mb-8">Admin Panel</h1>
        <WalkinBooking />
      </main>
    </div>
  );
};

export default Admin;
