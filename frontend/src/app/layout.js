import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Crop saver – Crop Disease Prediction",
  description: "Crop saver – AI-powered crop disease prediction platform. Upload a leaf image and get an instant diagnosis for Paddy, Chilli, Finger Millet, and Sugarcane.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
