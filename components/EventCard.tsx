import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  priority?: boolean;
}

const iconStyle = { width: "auto", height: "auto" } as const;

const EventCard = ({ title, image, slug, date, location, time, priority = false }: Props) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <div className="poster">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={priority}
        />
      </div>
      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="" width={14} height={14} style={iconStyle} />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="" width={14} height={14} style={iconStyle} />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="" width={14} height={14} style={iconStyle} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
