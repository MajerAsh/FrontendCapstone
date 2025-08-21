const MAP = {
  "Myco Master": {
    svg: "/svgs/MycoMaster.svg",
    title: "Myco Master — 25+ distinct species logged",
  },
  "Seasoned Forager": {
    svg: "/svgs/seasonedforager.svg",
    title: "Seasoned Forager — 10+ distinct species logged",
  },
  Fruiting: {
    svg: "/svgs/fruiting.svg",
    title: "Fruiting — 5+ distinct species logged",
  },
};

export default function BadgePill({ badge, size = 24, className = "" }) {
  if (!badge || !MAP[badge]) return null;
  const { svg, title } = MAP[badge];
  return (
    <img
      src={svg}
      alt={badge}
      title={title}
      width={size}
      height={size}
      className={`user-badge-img ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
