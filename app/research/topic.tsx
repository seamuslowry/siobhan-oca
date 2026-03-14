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
        {/* need a max height on the grid for the scrolling behavior desired on the right column */}
        <div className="grid grid-rows-1 md:grid-cols-[7fr_auto_3fr] max-h-[80vh] min-h-0">
          <div className="ml-2 md:mx-8 my-4 flex flex-col gap-4">
            {description.map((v, i) => (
              <AnyContent key={i} value={v} />
            ))}
          </div>

          <Divider vertical className="hidden md:block" />

          <div className="my-4 text-sm md:text-base min-h-0 overflow-auto">
            {papers.map((paper, i) => (
              <Paper paper={paper} key={i} />
            ))}
          </div>
        </div>
      </Accordion>
    </section>
  );
}
