import React from "react";
import styled from "styled-components";

// Composants de base pour le menu déroulant
const StyledDropdownMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledDropdownMenuTrigger = styled.div`
  display: inline-flex;
  cursor: pointer;
`;

const StyledDropdownMenuContent = styled.div`
  position: absolute;
  z-index: 1000;
  min-width: 220px;
  max-height: 450px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface || "#ffffff"};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  right: ${({ align }) => (align === "end" ? "0" : "auto")};
  left: ${({ align }) => (align === "start" ? "0" : "auto")};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &[data-state="open"] {
    animation: slideDownAndFade 0.2s ease-out;
  }

  &[data-state="closed"] {
    display: none;
  }

  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StyledDropdownMenuItem = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text?.primary || "#333"};
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover || "#f5f5f5"};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.hover || "#f5f5f5"};
  }
`;

// Composants React avec contexte
const DropdownMenuContext = React.createContext(null);

export const DropdownMenu = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Utiliser soit l'état contrôlé (si fourni) soit l'état interne
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    setInternalOpen(value);
  };

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, setOpen }}>
      <StyledDropdownMenu>{children}</StyledDropdownMenu>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  console.log("DropdownMenuTrigger rendered, open:", open);

  const handleClick = (e) => {
    // Ne pas empêcher le comportement par défaut car il pourrait être nécessaire
    console.log("DropdownMenuTrigger handleClick called");
    setOpen(!open);
  };

  if (asChild) {
    console.log("Using asChild mode for trigger");
    return React.cloneElement(children, {
      onClick: (e) => {
        console.log("DropdownMenuTrigger child clicked");
        // Appeler d'abord l'onClick de l'enfant s'il existe
        if (children.props.onClick) {
          children.props.onClick(e);
        }
        // Puis basculer l'état ouvert/fermé sans preventDefault
        setOpen(!open);
      },
    });
  }

  return (
    <StyledDropdownMenuTrigger onClick={handleClick}>
      {children}
    </StyledDropdownMenuTrigger>
  );
};

export const DropdownMenuContent = ({
  children,
  align = "center",
  className = "",
}) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <StyledDropdownMenuContent
      ref={ref}
      align={align}
      data-state={open ? "open" : "closed"}
      className={className}
    >
      {children}
    </StyledDropdownMenuContent>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = "" }) => {
  const { setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    // Ne pas fermer automatiquement pour permettre d'interagir avec les éléments à l'intérieur
    // Sauf si onClick est défini - dans ce cas on considère qu'il s'agit d'une action finale
    if (onClick) {
      setOpen(false);
    }
  };

  return (
    <StyledDropdownMenuItem onClick={handleClick} className={className}>
      {children}
    </StyledDropdownMenuItem>
  );
};
