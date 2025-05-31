import { useCallback, useState } from "react";
import Select from "react-select";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { Modality } from "@google/genai";

const responseOptions = [
  { value: "audio", label: "audio" },
  { value: "text", label: "text" },
];

export default function ResponseModalitySelector() {
  const { config, setConfig } = useLiveAPIContext();

  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(responseOptions[0]);

  const updateConfig = useCallback(
    (modality: "audio" | "text") => {
      setConfig({
        ...config,
        responseModalities: [
          modality === "audio" ? Modality.AUDIO : Modality.TEXT,
        ],
      });
    },
    [config, setConfig]
  );

  return (
    <div className="select-group">
      <label htmlFor="response-modality-selector">Response modality</label>
      <Select
        id="response-modality-selector"
        className="react-select"
        classNamePrefix="react-select"
        // SCSS tokens for light theme (approximations for direct use in JS)
        // $light-gray: #f8f9fa;
        // $dark-gray: #343a40;
        // $primary-color: #007bff;
        // $border-color: #dee2e6;
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isDisabled ? '#e9ecef' : '#fff',
            borderColor: state.isFocused ? '#007bff' : '#dee2e6',
            boxShadow: state.isFocused ? `0 0 0 1px #007bff` : baseStyles.boxShadow,
            '&:hover': {
              borderColor: state.isFocused ? '#007bff' : '#adb5bd',
            },
            color: '#343a40',
            minHeight: "38px", // Match .form-control style from inputs.scss
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected
              ? '#007bff'
              : state.isFocused
              ? '#e9ecef'
              : '#fff',
            color: state.isSelected ? '#fff' : '#343a40',
            '&:active': {
              backgroundColor: '#0056b3',
            },
          }),
          singleValue: (baseStyles) => ({ ...baseStyles, color: '#343a40' }),
          menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#fff' }),
        }}
        defaultValue={selectedOption}
        options={responseOptions}
        onChange={(e) => {
          setSelectedOption(e);
          if (e && (e.value === "audio" || e.value === "text")) {
            updateConfig(e.value);
          }
        }}
      />
    </div>
  );
}
