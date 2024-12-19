import React from "react";

const StyledButton = ({ onClick, children }) => {
    const buttonStyle = {
        backgroundColor: "#3498db", // Blue background
        color: "#fff", // White text
        padding: "10px 20px", // Padding
        fontSize: "16px", // Font size
        borderRadius: "5px", // Rounded corners
        border: "none", // Remove border
        cursor: "pointer", // Pointer cursor on hover
        margin: "0 20px", // Space between buttons
        transition: "background-color 0.3s ease", // Smooth hover transition
      };
    
      const buttonHoverStyle = {
        backgroundColor: "#2980b9", // Darker blue on hover
      };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={(e) =>
        (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)
      }
      onMouseLeave={(e) =>
        (e.target.style.backgroundColor = buttonStyle.backgroundColor)
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default StyledButton;
