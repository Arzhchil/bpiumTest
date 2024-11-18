import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import classNames from "classnames";
import { Input, InputNumber, Select } from "antd";
import MaskedInput from "react-input-mask";

import PropTypes from "prop-types";

import { formatCharsInput, formatCharacters } from "./maskFormat";
import maskIsValid from "./maskValidator";

import * as styles from "./styles.css";

const { TextArea } = Input;
const { Option, OptGroup } = Select;

const CodeEditor = ({
  inputRef,
  value,
  onChange,
  onBlur,
  className,
  style,
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    onBlur(newValue);
  };

  return (
    <TextArea
      rows={4}
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      className={className}
      style={style}
    />
  );
};

const TextInputWithActions = ({
  autoFocus,
  readOnly,
  prepareNumber,
  allowTabs,
  type,
  theme,
  multiline,
  script,
  minRows = 1,
  maxRows = 20,
  mask,
  options,
  value,
  onChange,
  onEndEditing,
  actions,
  className,
  style,
  wrapperClassName,
  actionsClassName,
  inputWrapperClassName,
  ...otherProps
}) => {
  const [actionsWidth, setActionsWidth] = useState(0);
  const [currentValue, setCurrentValue] = useState(value);
  const [oldValue, setOldValue] = useState("");

  const inputRef = useRef(null);
  const actionsRef = useRef(null);
  const changeTimer = useRef(null);

  const recalcActionsWidth = useCallback(() => {
    if (!actionsRef.current) return;
    const width = actionsRef.current.clientWidth;
    if (width !== actionsWidth) {
      setActionsWidth(width);
    }
  }, [actionsWidth]);

  const handleDebounceCancel = useCallback(() => {
    clearTimeout(changeTimer.current);
  }, []);

  const handleDebounceChange = useCallback(
    (newValue) => {
      handleDebounceCancel();
      changeTimer.current = setTimeout(() => {
        onChange(newValue);
      }, 200);
    },
    [onChange, handleDebounceCancel]
  );

  const setBlur = useCallback(
    (newValue) => {
      setCurrentValue(newValue);
      handleDebounceCancel();
      onChange(newValue);
      if (newValue !== oldValue) {
        onEndEditing(newValue);
      }
      setOldValue(newValue);
    },
    [onChange, onEndEditing, handleDebounceCancel, oldValue]
  );

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);
      handleDebounceChange(newValue);
    },
    [handleDebounceChange]
  );

  const setValue = useCallback(
    (newValue) => {
      setCurrentValue(newValue);
      handleDebounceChange(newValue);
    },
    [handleDebounceChange]
  );

  const handleChangeNumber = useCallback(
    (newValue) => {
      console.log("Input changed:", newValue);
      const valueStr = newValue ? newValue.toString() : "";
      const validateDigit = formatCharacters["1"].validate;
      const numericValue = valueStr
        .split("")
        .filter((char) => validateDigit(char))
        .join("");
      const preparedValue = prepareNumber
        ? prepareNumber(numericValue)
        : numericValue;
      setCurrentValue(preparedValue);
      handleDebounceChange(preparedValue);
    },
    [prepareNumber, handleDebounceChange]
  );

  const handleBlurNumber = useCallback(
    (e) => {
      if (readOnly) return;
      let newValue = e.target.value;
      newValue = prepareNumber ? prepareNumber(newValue) : newValue;
      if (newValue || oldValue !== "") {
        setBlur(newValue);
      }
    },
    [prepareNumber, setBlur, readOnly, oldValue]
  );

  const handleBlur = useCallback(
    (e) => {
      if (readOnly) return;
      const newValue = e.target.value;
      setBlur(newValue);
    },
    [setBlur, readOnly]
  );

  const handleBlurSelect = useCallback(() => {
    if (readOnly) return;
    setBlur(currentValue);
  }, [setBlur, readOnly, currentValue]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!allowTabs) return;
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        document.execCommand("insertText", false, "\t");
        return false;
      }
    },
    [allowTabs]
  );

  const handleChangeMasked = useCallback(
    (e) => {
      const newValue = e.target.value;
      if (newValue === mask.replace(/[^-]/g, "_")) {
        setValue("");
      } else {
        setValue(newValue);
      }
    },
    [setValue, mask]
  );

  const getPlaceholderMask = useCallback((mask) => {
    const charsEditableMask = Object.keys(formatCharsInput).join("");
    let placeholder = "";
    let shielding = false;

    for (let i = 0; i < mask.length; i++) {
      if (shielding) {
        shielding = false;
        placeholder += mask[i];
        continue;
      }

      if (mask[i] === "\\") {
        shielding = true;
        continue;
      }

      if (charsEditableMask.includes(mask[i])) {
        placeholder += "_";
        continue;
      }

      placeholder += mask[i];
    }

    return placeholder;
  }, []);

  const renderSelectOption = useCallback(
    (o) => (
      <Option value={o.value} label={o.label}>
        {o.label}
        {o.subLabel && (
          <span className={styles.optionSubLabel}>{o.subLabel}</span>
        )}
      </Option>
    ),
    []
  );

  useEffect(() => {
    recalcActionsWidth();
    if (autoFocus) {
      inputRef.current.focus();
    }
  }, [recalcActionsWidth, autoFocus]);

  useEffect(() => {
    window.addEventListener("resize", recalcActionsWidth);
    return () => window.removeEventListener("resize", recalcActionsWidth);
  }, [recalcActionsWidth]);

  const containerCN = classNames(wrapperClassName, styles.textInputContainer, {
    [styles.inputMask]: !multiline && maskIsValid(mask),
  });

  let inputCN = classNames(className, {
    [styles.inputReadOnly]: readOnly,
    [styles[theme]]: theme,
    [styles.readOnly]: readOnly,
  });

  const actionsCN = styles.inputWithActions;

  const inputStyle = { ...style };
  const actionsStyle = {};

  if (!actions || actions.length === 0) {
    actionsStyle.visibility = "hidden";
  } else if (actionsWidth) {
    inputStyle.paddingRight = actionsWidth;
  }

  let control;

  if (type === "number") {
    control = readOnly ? (
      <span className={inputCN}>
        {prepareNumber && prepareNumber(currentValue)}
      </span>
    ) : (
      <InputNumber
        ref={inputRef}
        onKeyDown={handleKeyDown}
        className={inputCN}
        value={currentValue}
        onChange={handleChangeNumber}
        onBlur={handleBlurNumber}
        style={style}
        {...otherProps}
      />
    );
  } else if (mask && maskIsValid(mask)) {
    control = (
      <MaskedInput
        formatChars={formatCharsInput}
        onKeyDown={handleKeyDown}
        mask={mask}
        {...otherProps}
        placeholder={getPlaceholderMask(mask)}
        value={currentValue}
        style={inputStyle}
        className={inputCN}
        onChange={handleChangeMasked}
        onBlur={handleBlur}
        disabled={readOnly}
      >
        {(inputProps) => <Input {...inputProps} ref={inputRef} />}
      </MaskedInput>
    );
  } else if (script) {
    control = (
      <CodeEditor
        ref={inputRef}
        {...otherProps}
        value={currentValue}
        style={inputStyle}
        className={inputCN}
        onChange={setValue}
        onBlur={setBlur}
        rows={minRows}
      />
    );
  } else if (options) {
    inputStyle.width = "100%";
    const valueInOptions = options.some((o) => {
      if (o.value === currentValue) return true;
      if (Array.isArray(o.options)) {
        return o.options.some((opt) => opt.value === currentValue);
      }
      return false;
    });

    if (!valueInOptions && currentValue) {
      inputCN = classNames(inputCN, styles.invalidValue);
    }

    control = (
      <Select
        ref={inputRef}
        {...otherProps}
        className={inputCN}
        style={inputStyle}
        value={currentValue}
        onChange={setValue}
        onBlur={handleBlurSelect}
        onInputKeyDown={handleKeyDown}
        showSearch
        variant={false}
        popupMatchSelectWidth={300}
        filterOption={(input, option) =>
          (option.label || "").toLowerCase().includes(input.toLowerCase())
        }
      >
        {options.map((o) => {
          if (Array.isArray(o.options)) {
            return (
              <OptGroup key={o.value} label={o.label}>
                {o.options.map((opt) => renderSelectOption(opt))}
              </OptGroup>
            );
          }
          return renderSelectOption(o);
        })}
      </Select>
    );
  } else if (multiline) {
    control = (
      <TextArea
        ref={inputRef}
        {...otherProps}
        value={currentValue}
        spellCheck="false"
        rows={4}
        autoSize={{ minRows: readOnly ? 1 : minRows, maxRows }}
        className={classNames(inputCN, styles.textArea)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  } else if (otherProps.children) {
    control = (
      <div style={inputStyle} className={classNames("ant-input", inputCN)}>
        {otherProps.children}
      </div>
    );
  } else {
    control = (
      <Input
        ref={inputRef}
        {...otherProps}
        value={currentValue}
        style={inputStyle}
        className={inputCN}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div className={containerCN}>
      {control}
      {actions && actions.length > 0 && (
        <ul
          className={classNames(actionsClassName, actionsCN)}
          ref={actionsRef}
          style={actionsStyle}
        >
          {actions.map((node, i) => (
            <li key={i}>{node}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const UniversalInput = ({
  updateProcess,
  eventable,
  actions,
  onEndEditing,
  onChange,
  ...props
}) => {
  const [shouldProcess, setShouldProcess] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (onChange) {
        onChange(e);
      }
      if (eventable) {
        setShouldProcess(true);
      }
    },
    [onChange, eventable]
  );

  const handleEndEditing = useCallback(
    (value) => {
      if (onEndEditing) {
        onEndEditing(value);
      }
      setShouldProcess(false);
    },
    [onEndEditing]
  );

  const inProcess = updateProcess?.get("inProcess");

  const newActions = useMemo(() => {
    const actionsArray = [...(actions || [])];
    if (shouldProcess || inProcess) {
      actionsArray.push(
        <span
          key="process-icon"
          className={classNames(styles.actionIcon, {
            [styles.actionIconGray]: inProcess,
          })}
          title={inProcess ? "" : "ready to send"}
        />
      );
    }
    return actionsArray;
  }, [actions, shouldProcess, inProcess]);

  return (
    <TextInputWithActions
      {...props}
      onEndEditing={handleEndEditing}
      onChange={handleChange}
      actions={newActions}
      prepareNumber={props.prepareNumber}
    />
  );
};

UniversalInput.propTypes = {
  updateProcess: PropTypes.object,
  eventable: PropTypes.bool,
  actions: PropTypes.arrayOf(PropTypes.node),
  onEndEditing: PropTypes.func,
  onChange: PropTypes.func,
};

UniversalInput.defaultProps = {
  updateProcess: null,
  eventable: false,
  actions: [],
  onEndEditing: () => {},
  onChange: () => {},
};

export default UniversalInput;
