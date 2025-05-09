import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "Etere Studio",
  description: "We shape the unseen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
