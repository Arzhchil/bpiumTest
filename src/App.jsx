import React, { useState, useEffect } from "react";
import "./App.css";
import UniversalInput from "./UniversalInput";

const defaultValues = {
  first: "",
  second: "",
  third: "",
  four: "",
  five: "",
};

const inputConfigs = [
  {
    key: "first",
    type: "number",
    placeholder: "Number type",
    style: { width: "100%" },
    className: "inputItem",
  },
  {
    key: "second",
    placeholder: "Text type",
    style: { width: "100%" },
    className: "inputItem",
  },
  {
    key: "third",
    multiline: true,
    placeholder: "Text multiline type",
    style: { width: "100%" },
    className: "inputItem",
  },
  {
    key: "four",
    mask: "111-111",
    placeholder: "With mask",
    style: {
      width: "100%",
      backgroundColor: "white",
      color: "black",
      borderRadius: "15px",
    },
    className: "inputItem",
  },
  {
    key: "five",
    options: [
      { value: "first element", label: "first element" },
      { value: "second element", label: "second element" },
      { value: "third element", label: "third element" },
    ],
    placeholder: "Another type",
    style: {
      width: "100%",
      backgroundColor: "white",
      color: "black",
      borderRadius: "15px",
    },
    className: "inputItem",
  },
];

const App = () => {
  const [values, setValues] = useState(() => {
    const savedValues = localStorage.getItem("values");
    if (savedValues) {
      try {
        return JSON.parse(savedValues);
      } catch (e) {
        console.error("Error parsing saved values from localStorage", e);
      }
    }
    return defaultValues;
  });

  useEffect(() => {
    localStorage.setItem("values", JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "values") {
        if (e.newValue) {
          try {
            const newValues = JSON.parse(e.newValue);
            setValues((prevValues) =>
              JSON.stringify(prevValues) !== e.newValue ? newValues : prevValues
            );
          } catch (error) {
            console.error("Error parsing newValue from storage event", error);
          }
        } else {
          setValues(defaultValues);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleInputChange = (key) => (e) => {
    const value = e?.target?.value ?? e;
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  return (
    <div className="main">
      <h1 className="title">THIS IS NOT A TEST TASK</h1>
      <div className="inputItems">
        {inputConfigs.map((config) => {
          const { key, ...restConfig } = config;
          return (
            <UniversalInput
              key={key}
              {...restConfig}
              disabled={false}
              value={values[key] || ""}
              onChange={handleInputChange(key)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default App;
