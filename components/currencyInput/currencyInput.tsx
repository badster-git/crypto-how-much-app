import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { CurrencyFormatter } from "utils";

interface ICryptoOptions {
  id: string;
  symbol: string;
}
interface IPriceInfo extends ICryptoOptions {
  locale: string;
  previousPrice: number;
  currentPrice: number;
  dateBought: string;
  amountBought: string;
  profit: string;
  totalMade: string;
}
interface ICurrencyOptions {
  abbreviation: string;
  symbol: string;
}

const cryptoInputOptions: ICryptoOptions[] = [
  {
    id: "bitcoin",
    symbol: "btc",
  },
  {
    id: "ethereum",
    symbol: "etc",
  },
  {
    id: "bitcoin-cash",
    symbol: "bch",
  },
];

const currencyInputOptions: ICurrencyOptions[] = [
  {
    abbreviation: "usd",
    symbol: "$",
  },
  {
    abbreviation: "eur",
    symbol: "€",
  },
  {
    abbreviation: "jpy",
    symbol: "¥",
  },
  {
    abbreviation: "gbp",
    symbol: "£",
  },
  {
    abbreviation: "chf",
    symbol: "Fr",
  },
  {
    abbreviation: "cad",
    symbol: "C$",
  },
  {
    abbreviation: "aud",
    symbol: "A$",
  },
  {
    abbreviation: "zar",
    symbol: "R",
  },
];

const validationSchema = Yup.object().shape({
  currency: Yup.number()
    .required("*required")
    .min(1000, "*required")
    .positive(),
  currencyType: Yup.string()
    .required("*required")
    .oneOf(
      currencyInputOptions.map((val) => val.abbreviation),
      "*required"
    ),
  cryptoType: Yup.string()
    .required("*required")
    .oneOf(cryptoInputOptions.map((val) => val.id)),
  selectedDate: Yup.date()
    .required("*required")
    .max(new Date().toLocaleDateString(), "date must be earlier"),
});

export function CurrencyInputForm() {
  const [priceData, setPriceData] = useState<IPriceInfo | undefined>(undefined);
  const formik = useFormik({
    initialValues: {
      currency: "",
      currencyType: "usd",
      cryptoType: "bitcoin",
      selectedDate: "",
    },
    validationSchema: validationSchema,
    async onSubmit(values, actions) {
      actions.setSubmitting(true);
      // grap data & fix up date for API
      const { currency, currencyType, cryptoType, selectedDate } = values;
      const [year, month, day] = selectedDate.split("-");
      const formattedDate = `${day}-${month}-${year}`;

      let AInstance = axios.create({
        baseURL: "https://api.coingecko.com/api/v3/",
        timeout: 5000,
      });

      // get API data
      const currentDataResp = await AInstance.get(`/coins/${cryptoType}`)
        .then((res) => res.data)
        .catch((err) => {
          if (err.response) {
            console.log(err.response.status);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log("Error", err.message);
          }
        });
      const previousDataResp = await AInstance.get(
        `/coins/${cryptoType}/history`,
        {
          params: { date: formattedDate },
        }
      )
        .then((res) => res.data)
        .catch((err) => {
          if (err.response) {
            console.log(err.response.status);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log("Error", err.message);
          }
        });

      // Get prices of crypto
      const previousCryptoPrice = Number(
          previousDataResp["market_data"]["current_price"][currencyType]
        ),
        currentCryptoPrice = Number(
          currentDataResp["market_data"]["current_price"][currencyType]
        );

      // calculate holdings in crypto
      const currentCryptoHeld = Number(currency) / currentCryptoPrice,
        previousCryptoHeld = Number(currency) / previousCryptoPrice;

      // calculate profit
      const cryptoProfit = previousCryptoHeld - currentCryptoHeld,
        totalCryptoMade = cryptoProfit + currentCryptoHeld,
        currencyProfit = currentCryptoPrice * cryptoProfit,
        totalCurrencyMade = currentCryptoPrice * totalCryptoMade;

      console.log(
        previousCryptoPrice,
        currentCryptoPrice,
        previousCryptoHeld,
        currentCryptoHeld,
        cryptoProfit,
        currencyProfit,
        totalCryptoMade,
        totalCurrencyMade
      );

      // store price data in object according to interface shape
      const priceData: IPriceInfo = {
        id: cryptoType,
        symbol: currencyInputOptions.reduce((prev, val) => {
          if (val.abbreviation == currencyType) {
            return val.symbol;
          }
          return prev;
        }, ""),
        locale: currencyType,
        previousPrice: previousCryptoPrice,
        currentPrice: currentCryptoPrice,
        dateBought: selectedDate,
        amountBought: currency,
        profit: CurrencyFormatter(currencyType, currencyProfit),
        totalMade: CurrencyFormatter(currencyType, totalCurrencyMade),
      };
      // update state
      setPriceData(priceData);
      actions.setSubmitting(false);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="md:flex mb-2">
          <div className="md:w-1/3">
            <legend className="uppercase tracking-wide text-sm">
              What is this?
            </legend>
            <p className="text-xs font-light md:w-[15rem] mt-2">
              Checks potential profits you could've made if you'd had invested
              in a coin at a certain date.
            </p>
          </div>
          <div className="md:flex w-full justify-center mt-2 mb:mt-0 md:px-3">
            <div className="mt-4">
              <select
                id="selectedCurrencyType"
                name="currencyType"
                value={formik.values.currencyType}
                onChange={(value) => {
                  console.log(value);
                  formik.setFieldValue("currencyType", value.target.value);
                }}
                className="transition duration-300 ease-in-out px-3 py-2 rounded border w-26 focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                {currencyInputOptions.map((val, idx) => (
                  <option key={idx} value={val.abbreviation}>
                    {val.abbreviation}
                  </option>
                ))}
              </select>
              {formik.errors.currency && formik.touched.currency && (
                <div
                  className={
                    "text-red-700 pb-2 ml-3 absolute w-[8rem] font-light text-sm"
                  }
                >
                  {formik.errors.currencyType}
                </div>
              )}
            </div>
            <div className="mb-4 ml-2">
              <label className="block uppercase tracking-wide text-xs font-bold">
                Amount
              </label>
              <CurrencyInput
                id="nominal"
                name="nominal"
                placeholder={`Enter ${formik.values.currencyType.toUpperCase()}`}
                defaultValue={0}
                decimalsLimit={2}
                allowNegativeValue={false}
                step={500}
                value={formik.values.currency}
                onValueChange={(value) => {
                  console.log(value);
                  formik.setFieldValue("currency", value);
                }}
                prefix={`${currencyInputOptions.reduce((prev, val) => {
                  if (val.abbreviation == formik.values.currencyType) {
                    return val.symbol;
                  }
                  return prev;
                }, "")} `}
                className="transition duration-300 ease-in-out px-3 py-2 rounded border w-26 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              {formik.errors.currency && formik.touched.currency && (
                <div
                  className={
                    "text-red-700 pb-2 ml-3 absolute w-[8rem] font-light text-sm"
                  }
                >
                  {formik.errors.currency}
                </div>
              )}
            </div>
            <div className="mb-4 ml-2">
              <label className="block uppercase tracking-wide text-xs font-bold">
                Date
              </label>
              <input
                id="selectedDate"
                type="date"
                name="date"
                value={formik.values.selectedDate}
                onChange={(value) => {
                  formik.setFieldValue("selectedDate", value.target.value);
                }}
                className="transition duration-300 ease-in-out px-3 py-2 rounded border w-26 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              {formik.errors.selectedDate && formik.touched.selectedDate && (
                <div
                  className={
                    "text-red-700 pb-2 ml-3 absolute w-[8rem] font-light text-sm"
                  }
                >
                  {formik.errors.selectedDate}
                </div>
              )}
            </div>
            <div className="ml-2 mt-4">
              <select
                id="selectedCryptoType"
                name="cryptoType"
                value={formik.values.cryptoType}
                onChange={(value) => {
                  console.log(value);
                  formik.setFieldValue("cryptoType", value.target.value);
                }}
                className="transition duration-300 ease-in-out px-3 py-2 rounded border w-26 focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                {cryptoInputOptions.map((val, idx) => (
                  <option key={idx} value={val.id}>
                    {val.symbol}
                  </option>
                ))}
              </select>
              {formik.errors.cryptoType && formik.touched.cryptoType && (
                <div
                  className={
                    "text-red-700 pb-2 ml-3 absolute w-[8rem] font-light text-sm"
                  }
                >
                  {formik.errors.cryptoType}
                </div>
              )}
            </div>
            <div className="ml-2 mt-4">
              <button
                type="submit"
                className="transition duration-300 ease-in-out px-3 py-2 text-cream-light rounded border w-26  bg-brick hover:bg-brick-dark"
                disabled={formik.isSubmitting}
              >
                Check Profits
              </button>
            </div>
          </div>
        </div>
        <div className="md:flex mb-8">
          <div className="md:w-1/3">
            <legend className="uppercase tracking-wide text-sm">Why?</legend>
            <p className="text-xs font-light md:w-[15rem] mt-2">
              Just felt like making it. No real reason.
            </p>
          </div>
          <div className="md:flex mb-4 justify-center">
            {priceData && (
              <div className="text-center mt-2">
                <p className="text-md font-light">
                  If you had bought{" "}
                  <span id="amountBought">
                    {priceData?.symbol}
                    {priceData?.amountBought}{" "}
                  </span>
                  of {priceData.id} on {priceData.dateBought} you would have
                  around <span id="totalMade">{priceData?.totalMade}</span> right now.
                </p>

                <p className="text-md font-light">
                  A total of about {priceData.profit} in profit.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
