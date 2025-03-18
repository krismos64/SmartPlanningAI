import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import styled from "styled-components";

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .icon {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LanguageIcon = styled(FiGlobe)`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const CustomMenuItem = styled(MenuItem)`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.selected {
    background-color: ${({ theme }) => theme.colors.primary}10;
    font-weight: 500;
  }

  .flag {
    width: 20px;
    height: 15px;
    object-fit: cover;
    margin-right: 0.5rem;
  }
`;

const LanguageName = styled.span`
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
`;

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    handleClose();
  };

  return (
    <>
      <LanguageButton
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open ? "true" : "false"}
      >
        <LanguageIcon />
        <LanguageName>
          {currentLanguage.flag} {currentLanguage.name}
        </LanguageName>
        <FiChevronDown className="icon" />
      </LanguageButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
        PaperProps={{
          style: {
            borderRadius: "8px",
            minWidth: "180px",
          },
        }}
      >
        {languages.map((language) => (
          <CustomMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? "selected" : ""}
          >
            <span>{language.flag}</span>
            {t(`language.${language.code}`)}
          </CustomMenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
