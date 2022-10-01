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
  profit: number;
  previousPrice: number;
  currentPrice: number;
  totalMade: number;
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
  currency: Yup.number().required().min(1000).positive(),
  currencyType: Yup.string()
    .required()
    .oneOf(currencyInputOptions.map((val) => val.abbreviation)),
  cryptoType: Yup.string()
    .required()
    .oneOf(cryptoInputOptions.map((val) => val.id)),
  selectedDate: Yup.date().required().max(new Date().toLocaleDateString()),
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
      const cryptoProfit = currentCryptoHeld - previousCryptoHeld,
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
        profit: currencyProfit,
        totalMade: totalCurrencyMade,
      };
      // update state
      setPriceData(priceData);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex items-center">
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
          <select
            id="selectedCurrencyType"
            name="currencyType"
            value={formik.values.currencyType}
            onChange={(value) => {
              console.log(value);
              formik.setFieldValue("currencyType", value.target.value);
            }}
          >
            {currencyInputOptions.map((val, idx) => (
              <option key={idx} value={val.abbreviation}>
                {val.abbreviation}
              </option>
            ))}
          </select>
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
          <select
            id="selectedCryptoType"
            name="cryptoType"
            value={formik.values.cryptoType}
            onChange={(value) => {
              console.log(value);
              formik.setFieldValue("cryptoType", value.target.value);
            }}
          >
            {cryptoInputOptions.map((val, idx) => (
              <option key={idx} value={val.id}>
                {val.symbol}
              </option>
            ))}
          </select>
          <button type="submit">Check</button>
          {formik.errors.currency && formik.touched.currency && (
            <div className={"text-red-700 pb-2"}>{formik.errors.currency}</div>
          )}
          {formik.errors.currencyType && formik.touched.currencyType && (
            <div className={"text-red-700 pb-2"}>{formik.errors.currency}</div>
          )}
          {formik.errors.selectedDate && formik.touched.selectedDate && (
            <div className={"text-red-700 pb-2"}>
              {formik.errors.selectedDate}
            </div>
          )}
          {formik.errors.cryptoType && formik.touched.cryptoType && (
            <div className={"text-red-700 pb-2"}>
              {formik.errors.cryptoType}
            </div>
          )}
        </div>
      </form>
      {priceData && (
        <div>
          {priceData.id} {priceData.locale}{" "}
          {CurrencyFormatter(priceData.locale, priceData.profit)}{" "}
          {priceData.symbol}{" "}
          {CurrencyFormatter(priceData.locale, priceData.totalMade)}
        </div>
      )}
    </div>
  );
}
