import { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";

const voiceOptions = [
  { value: "Puck", label: "Puck" },
  { value: "Charon", label: "Charon" },
  { value: "Kore", label: "Kore" },
  { value: "Fenrir", label: "Fenrir" },
  { value: "Aoede", label: "Aoede" },
  {value: "Zephyr", label: "Zephyr"},
];

const VoiceSelector: React.FC = () => { // Changed to const for memo
  const { config, setConfig } = useLiveAPIContext();

  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(voiceOptions[4]);

  const updateConfig = useCallback(
    (voiceName: string) => {
      setConfig({
        ...config,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      });
    },
    [config, setConfig]
  );

  useEffect(() => {
    const currentVoiceName =
      config.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName;
    const voiceName = currentVoiceName || "Aoede";
    const voiceOption = { value: voiceName, label: voiceName };
    setSelectedOption(voiceOption);
    if (!currentVoiceName) {
      updateConfig(voiceName);
    }
  }, [config, updateConfig]);

  return (
    <div className="select-group">
      <label htmlFor="voice-selector">Voice</label>
      <Select
        id="voice-selector"
        className="react-select"
        classNamePrefix="react-select"
        // SCSS tokens for light theme (approximations for direct use in JS)
        // $light-gray: #f8f9fa; (used for backgrounds)
        // $dark-gray: #343a40; (used for text)
        // $primary-color: #007bff;
        // $border-color: #dee2e6;
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isDisabled ? '#e9ecef' : '#fff', // Approx $light-gray for disabled, $white for normal
            borderColor: state.isFocused ? '#007bff' : '#dee2e6', // $primary-color, $border-color
            boxShadow: state.isFocused ? `0 0 0 1px #007bff` : baseStyles.boxShadow,
            '&:hover': {
              borderColor: state.isFocused ? '#007bff' : '#adb5bd', // $primary-color, $gray-500 approx
            },
            color: '#343a40', // $dark-gray
            minHeight: "38px", // Match .form-control style from inputs.scss
            // maxHeight: "33px", // Removed to allow default height based on content and minHeight
            // border: 0, // Replaced by borderColor for better control
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected
              ? '#007bff' // $primary-color
              : state.isFocused
              ? '#e9ecef' // Approx lighten($light-gray, 5%)
              : '#fff', // $white
            color: state.isSelected ? '#fff' : '#343a40', // White text on primary, else $dark-gray
            '&:active': {
              backgroundColor: '#0056b3', // Darken $primary-color
            },
          }),
          singleValue: (baseStyles) => ({ ...baseStyles, color: '#343a40' }), // $dark-gray
          menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#fff' }), // $white for menu background
        }}
        value={selectedOption}
        defaultValue={selectedOption}
        options={voiceOptions}
        onChange={(e) => {
          setSelectedOption(e);
          if (e) {
            updateConfig(e.value);
          }
        }}
      />
    </div>
  );
};

export default React.memo(VoiceSelector); // Wrapped with React.memo
