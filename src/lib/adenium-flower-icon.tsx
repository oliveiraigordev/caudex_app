/** Flor estilizada de Adenium para favicon (compatível com @vercel/og / Satori). */
export function adeniumFlowerOg(size: number) {
  const petalLight = "#f0a99e";
  const petal = "#e07062";
  const petalDeep = "#b84a3f";
  const throatLight = "#f7e08a";
  const throat = "#c45c4a";

  const cx = size / 2;
  const petalW = size * 0.36;
  const petalH = size * 0.5;
  const petals = [0, 72, 144, 216, 288];

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
      }}
    >
      {petals.map((deg) => (
        <div
          key={deg}
          style={{
            position: "absolute",
            left: cx,
            top: cx,
            width: petalW,
            height: petalH,
            marginLeft: -petalW / 2,
            marginTop: -petalH * 0.88,
            display: "flex",
            background: `linear-gradient(165deg, ${petalLight} 0%, ${petal} 45%, ${petalDeep} 100%)`,
            borderRadius: "48% 48% 42% 42%",
            transform: `rotate(${deg}deg)`,
            transformOrigin: `${petalW / 2}px ${petalH * 0.88}px`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cx,
          width: size * 0.28,
          height: size * 0.28,
          marginLeft: -(size * 0.14),
          marginTop: -(size * 0.14),
          display: "flex",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${throatLight} 0%, ${throat} 55%, #7a3329 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cx,
          width: size * 0.1,
          height: size * 0.1,
          marginLeft: -(size * 0.05),
          marginTop: -(size * 0.05),
          display: "flex",
          borderRadius: "50%",
          background: "#5c2a22",
        }}
      />
    </div>
  );
}
