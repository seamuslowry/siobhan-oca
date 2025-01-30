import { type Topic as TopicType } from '@/utils/research';
import { TextContent } from '@/components/text-content';
import { AnyContent } from '@/components/any-content';
import Accordion from '@/components/accordion';
import { Paper } from '@/app/research/paper';
import Divider from '@/components/divider';

export async function Topic({
  topic: { id, name, description, papers },
}: {
  topic: TopicType;
}) {
  return (
    <section id={id} className="scroll-mt-below-header">
      <Accordion
        summary={
          <TextContent value={name} desired={{ size: '5xl', tag: 'h2' }} />
        }
      >
        <div className="grid grid-rows-[auto_auto] md:grid-cols-[7fr_auto_3fr]">
          <div className="ml-2 md:mx-8 my-4 flex flex-col gap-4">
            {description.map((v, i) => (
              <AnyContent key={i} value={v} />
            ))}
          </div>
          <Divider vertical className="hidden md:block" />
          <div className="my-4 text-sm md:text-base">
            {papers.map((paper, i) => (
              <Paper paper={paper} key={i} />
            ))}
          </div>
        </div>
      </Accordion>
    </section>
  );
}
