import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LanguageSelectorContainer = styled.div`
  position: relative;
  font-size: 0.875rem;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const LanguageName = styled.span`
  margin: 0 0.5rem;
`;

const ChevronIcon = styled.span`
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const LanguageOptions = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 10;
  min-width: 180px;
  overflow: hidden;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  animation: ${fadeIn} 0.3s ease;
  transform-origin: top center;
`;

const LanguageOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background-color: ${({ isActive, theme }) =>
    isActive ? `${theme.colors.primary}15` : "transparent"};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
    transform: translateX(5px);
  }
`;

const Flag = styled.span`
  display: inline-block;
  margin-right: 10px;
  font-size: 1.2rem;
`;

const OptionText = styled.span`
  flex-grow: 1;
`;

// Version compacte avec drapeaux pour la navbar
const NavbarLanguageSelector = styled(LanguageSelectorContainer)`
  margin-left: 1rem;
`;

const FlagButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.2);
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
  }
`;

const NavbarLanguageOptions = styled(LanguageOptions)`
  right: 0;
  top: 120%;
  min-width: 150px;
`;

const LanguageSelector = ({ isNavbar = false }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const languages = [
    { code: "fr", name: t("language.fr"), flag: "🇫🇷" },
    { code: "en", name: t("language.en"), flag: "🇬🇧" },
    { code: "es", name: t("language.es"), flag: "🇪🇸" },
  ];

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === i18n.language) || languages[0]
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Fermer le menu déroulant quand on clique ailleurs sur la page
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentLang = getCurrentLanguage();

  if (isNavbar) {
    return (
      <NavbarLanguageSelector ref={containerRef}>
        <FlagButton onClick={toggleDropdown} title={currentLang.name}>
          {currentLang.flag}
        </FlagButton>
        <NavbarLanguageOptions isOpen={isOpen}>
          {languages.map((lang) => (
            <LanguageOption
              key={lang.code}
              isActive={i18n.language === lang.code}
              onClick={() => changeLanguage(lang.code)}
            >
              <Flag>{lang.flag}</Flag>
              <OptionText>{lang.name}</OptionText>
            </LanguageOption>
          ))}
        </NavbarLanguageOptions>
      </NavbarLanguageSelector>
    );
  }

  return (
    <LanguageSelectorContainer ref={containerRef}>
      <LanguageButton onClick={toggleDropdown}>
        <Flag>{currentLang.flag}</Flag>
        <LanguageName>{currentLang.name}</LanguageName>
        <ChevronIcon isOpen={isOpen}>▼</ChevronIcon>
      </LanguageButton>
      <LanguageOptions isOpen={isOpen}>
        {languages.map((lang) => (
          <LanguageOption
            key={lang.code}
            isActive={i18n.language === lang.code}
            onClick={() => changeLanguage(lang.code)}
          >
            <Flag>{lang.flag}</Flag>
            <OptionText>{lang.name}</OptionText>
          </LanguageOption>
        ))}
      </LanguageOptions>
    </LanguageSelectorContainer>
  );
};

export default LanguageSelector;
