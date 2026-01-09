import { TitleArrow } from '../../vectors/TitleArrow'

interface TopicArticleProps {
  specialPerk?: string
  text: string
  title: string
  topicColor?: string
  url: string
}

export function TopicArticle({
  specialPerk,
  text,
  title,
  topicColor,
  url,
}: TopicArticleProps) {
  const isTextSafe = !text.includes('<') || /<(p|strong|i|a) ?.*>/.test(text)
  const arrowColor = topicColor || '#0a1659'

  return (
    <div className="group">
      <a
        className="mt-5 md:m-0 font-medium leading-[1.33] text-lg md:text-2xl no-underline text-footer-dark"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        {title}
        <div
          className="relative top-[-2px] inline-block ml-2.5 opacity-0 group-hover:opacity-100"
          style={{ color: arrowColor }}
        >
          <TitleArrow />
        </div>
      </a>

      {isTextSafe ? (
        <p
          className="font-normal leading-[1.75] text-base text-footer-dark [&_strong]:font-medium [&_strong]:after:content-[' '] my-4"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <p className="font-normal leading-[1.75] text-base text-footer-dark [&_strong]:font-medium [&_strong]:after:content-[' '] my-4">
          {text}
        </p>
      )}

      {specialPerk && (
        <p className="font-normal leading-[1.75] text-base text-footer-dark [&_strong]:font-medium [&_strong]:after:content-[' ']">
          <strong>Special perk:</strong>
          {specialPerk}
        </p>
      )}
    </div>
  )
}
