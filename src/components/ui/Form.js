import { useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { inputFocus, fadeIn } from "../../styles/animations";

// Animations
const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-5px);
  }
  40%, 80% {
    transform: translateX(5px);
  }
`;

// Styles communs pour les inputs
const inputStyles = css`
  width: 100%;
  height: ${({ size, theme }) =>
    size === "sm" ? "36px" : size === "lg" ? "52px" : "44px"};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme, size }) =>
    size === "sm"
      ? theme.typography.sizes.sm
      : size === "lg"
      ? theme.typography.sizes.lg
      : theme.typography.sizes.md};
  transition: all 0.2s ease;
  ${inputFocus}

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }

  &:disabled {
    background-color: ${({ theme }) => `${theme.colors.border}33`};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  ${({ error, theme }) =>
    error &&
    css`
      border-color: ${theme.colors.error};
      animation: ${shake} 0.5s ease-in-out;

      &:focus {
        border-color: ${theme.colors.error};
        box-shadow: 0 0 0 3px ${`${theme.colors.error}33`};
      }
    `}
`;

// Composants stylisés
const StyledFormGroup = styled.div`
  margin-bottom: ${({ theme, noMargin }) =>
    noMargin ? "0" : theme.spacing.lg};
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, error }) =>
    error ? theme.colors.error : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  transition: all 0.2s ease;

  ${({ required }) =>
    required &&
    css`
      &::after {
        content: "*";
        color: ${({ theme }) => theme.colors.error};
        margin-left: ${({ theme }) => theme.spacing.xs};
      }
    `}
`;

const FloatingLabelContainer = styled.div`
  position: relative;
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme, error, isFocused, hasValue }) =>
    error
      ? theme.colors.error
      : isFocused
      ? theme.colors.primary
      : theme.colors.text.hint};
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.sizes.md};

  ${({ isFocused, hasValue }) =>
    (isFocused || hasValue) &&
    css`
      top: 0;
      transform: translateY(-50%);
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      background-color: ${({ theme }) => theme.colors.surface};
      padding: 0 ${({ theme }) => theme.spacing.xs};
    `}

  ${({ required }) =>
    required &&
    css`
      &::after {
        content: "*";
        color: ${({ theme }) => theme.colors.error};
        margin-left: 2px;
      }
    `}
`;

const Input = styled.input`
  ${inputStyles}

  ${({ hasFloatingLabel }) =>
    hasFloatingLabel &&
    css`
      &:focus + ${FloatingLabel}, &:not(:placeholder-shown) + ${FloatingLabel} {
        top: 0;
        transform: translateY(-50%);
        font-size: ${({ theme }) => theme.typography.sizes.xs};
        background-color: ${({ theme }) => theme.colors.surface};
        padding: 0 ${({ theme }) => theme.spacing.xs};
      }
    `}
`;

const Textarea = styled.textarea`
  ${inputStyles}
  height: auto;
  min-height: 100px;
  resize: vertical;
  padding: ${({ theme }) => theme.spacing.md};
`;

const Select = styled.select`
  ${inputStyles}
  appearance: none;
  padding-right: ${({ theme }) => theme.spacing.xl};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${({ theme }) => theme.spacing.md} center;
  background-size: 16px;

  &:focus {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233a86ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  & + label {
    position: relative;
    cursor: pointer;
    padding-left: 30px;
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    user-select: none;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: ${({ theme }) => theme.borderRadius.small};
      background-color: ${({ theme }) => theme.colors.surface};
      transition: all 0.2s ease;
    }

    &::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%) scale(0);
      width: 10px;
      height: 10px;
      border-radius: 1px;
      background-color: ${({ theme }) => theme.colors.primary};
      transition: all 0.2s ease;
    }
  }

  &:checked + label::before {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + label::after {
    transform: translateY(-50%) scale(1);
  }

  &:focus + label::before {
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }

  &:disabled + label {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.text.disabled};

    &::before {
      background-color: ${({ theme }) => `${theme.colors.border}33`};
      border-color: ${({ theme }) => theme.colors.border};
    }
  }
`;

const Radio = styled.input.attrs({ type: "radio" })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  & + label {
    position: relative;
    cursor: pointer;
    padding-left: 30px;
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    user-select: none;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.surface};
      transition: all 0.2s ease;
    }

    &::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%) scale(0);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.primary};
      transition: all 0.2s ease;
    }
  }

  &:checked + label::before {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + label::after {
    transform: translateY(-50%) scale(1);
  }

  &:focus + label::before {
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }

  &:disabled + label {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.text.disabled};

    &::before {
      background-color: ${({ theme }) => `${theme.colors.border}33`};
      border-color: ${({ theme }) => theme.colors.border};
    }
  }
`;

const Switch = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  & + label {
    position: relative;
    cursor: pointer;
    padding-left: 50px;
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    user-select: none;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 20px;
      border-radius: 10px;
      background-color: ${({ theme }) => `${theme.colors.border}`};
      transition: all 0.2s ease;
    }

    &::after {
      content: "";
      position: absolute;
      left: 2px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.surface};
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
  }

  &:checked + label::before {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + label::after {
    transform: translateY(-50%) translateX(20px);
  }

  &:focus + label::before {
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }

  &:disabled + label {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.text.disabled};

    &::before {
      background-color: ${({ theme }) => `${theme.colors.border}33`};
    }

    &::after {
      background-color: ${({ theme }) => `${theme.colors.border}66`};
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const HelpText = styled.div`
  color: ${({ theme }) => theme.colors.text.hint};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

// Composants de formulaire
export const FormInput = ({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helpText,
  required,
  disabled,
  size = "md",
  floatingLabel = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <StyledFormGroup>
      {label && !floatingLabel && (
        <Label htmlFor={id} error={!!error} required={required}>
          {label}
        </Label>
      )}

      {floatingLabel ? (
        <FloatingLabelContainer>
          <Input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            error={!!error}
            size={size}
            placeholder=" "
            hasFloatingLabel
            {...props}
          />
          <FloatingLabel
            htmlFor={id}
            error={!!error}
            isFocused={isFocused}
            hasValue={!!value}
            required={required}
          >
            {label}
          </FloatingLabel>
        </FloatingLabelContainer>
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          size={size}
          {...props}
        />
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helpText && !error && <HelpText>{helpText}</HelpText>}
    </StyledFormGroup>
  );
};

export const FormTextarea = ({
  label,
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  required,
  disabled,
  rows = 4,
  ...props
}) => (
  <StyledFormGroup>
    {label && (
      <Label htmlFor={id} error={!!error} required={required}>
        {label}
      </Label>
    )}
    <Textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      error={!!error}
      rows={rows}
      {...props}
    />
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {helpText && !error && <HelpText>{helpText}</HelpText>}
  </StyledFormGroup>
);

export const FormSelect = ({
  label,
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  required,
  disabled,
  size = "md",
  options = [],
  placeholder = "Sélectionner...",
  ...props
}) => (
  <StyledFormGroup>
    {label && (
      <Label htmlFor={id} error={!!error} required={required}>
        {label}
      </Label>
    )}
    <Select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      error={!!error}
      size={size}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {helpText && !error && <HelpText>{helpText}</HelpText>}
  </StyledFormGroup>
);

export const FormCheckbox = ({
  label,
  id,
  name,
  checked,
  onChange,
  error,
  helpText,
  disabled,
  ...props
}) => (
  <StyledFormGroup>
    <div>
      <Checkbox
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {helpText && !error && <HelpText>{helpText}</HelpText>}
  </StyledFormGroup>
);

export const FormRadio = ({
  label,
  id,
  name,
  value,
  checked,
  onChange,
  error,
  helpText,
  disabled,
  ...props
}) => (
  <StyledFormGroup>
    <div>
      <Radio
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {helpText && !error && <HelpText>{helpText}</HelpText>}
  </StyledFormGroup>
);

export const FormSwitch = ({
  label,
  id,
  name,
  checked,
  onChange,
  error,
  helpText,
  disabled,
  ...props
}) => (
  <StyledFormGroup>
    <div>
      <Switch
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {helpText && !error && <HelpText>{helpText}</HelpText>}
  </StyledFormGroup>
);

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${({ theme, variant }) =>
    variant === "secondary"
      ? theme.colors.secondary
      : variant === "danger"
      ? theme.colors.danger
      : theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Création d'un objet nommé pour l'export par défaut
const FormComponents = {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadio,
  FormSwitch,
  FormGroup,
  Button,
};

export default FormComponents;
