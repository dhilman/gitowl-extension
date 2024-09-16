export default function Drawer() {
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 80,
        top: 0,
        right: 0,
        backgroundColor: "red",
        width: "20vw",
        minWidth: "300px",
        height: "100%",

        margin: 0,
        padding: 0,
        borderRadius: 0,
      }}
    >
      <button
        style={{
          position: "fixed",
          zIndex: 80 /* github hover cards are 100 */,
          top: "20%",

          padding: "4px 14px",

          backgroundColor: "white",
          color: "black",
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.5,
          fontFamily: "inherit",

          borderBottom: "none",
          borderRight: "2px solid rgb(0, 0, 0, 0.1)",
          borderLeft: "2px solid rgb(0, 0, 0, 0.1)",
          borderTop: "2px solid rgb(0, 0, 0, 0.1)",
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,

          transition: "all 0.3s ease-in-out",
          transformOrigin: "bottom right",
          transform: "translateX(-100%) rotate(-90deg)",
        }}
      >
        Hello World
      </button>
    </div>
  );
}
