import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { InputForm } from "components/inputForm/inputForm";
import { CurrencyInputForm } from "components/currencyInput/currencyInput";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen leading-normal overflow-x-hidden lg:overflow-auto bg-cream font-sans">
      <Head>
        <title>Bitcoin Price Tracker</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 md:p-0 lg:pt-8 lg:px-8 md:ml-24 flex flex-col">
        <section className="p-4 shadow bg-cream-light rounded-md">
          <div className="md:flex">
            <h2 className="md:w-1/3 uppercase tracking-wide text-sm sm:text-lg mb-6 ">
              Crypto Profit Checker
            </h2>
          </div>
          <CurrencyInputForm />
        </section>
      </main>
    </div>
  );
};

export default Home;
