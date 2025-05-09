import "./globals.css";
<<<<<<< HEAD
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
    title: "Etere Studio",
    description: "We shape the unseen"
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
=======

export const metadata = {
  title: "Algora",
  description: "Your AI art portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
>>>>>>> 20637ed (cleanup)
