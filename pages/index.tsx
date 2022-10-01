import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { InputForm } from 'components/inputForm/inputForm'
import { CurrencyInputForm } from 'components/currencyInput/currencyInput'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Bitcoin Price Tracker</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='container w-full'>
        <h1 className='text-center font-bold'>Check how much you'd have here!</h1>
        <CurrencyInputForm />
      </main>
    </div>
  )
}

export default Home
