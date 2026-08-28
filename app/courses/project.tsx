import Slider, { type SliderItem } from '@/components/slider';
import { Fragment } from 'react';
import { type Project as ProjectType } from '@/utils/courses';
import { TextContent } from '@/components/text-content';
import MediaContent from '@/components/media-content';

export async function Project({
  project: { name, collaborators, media, id },
}: {
  project: ProjectType;
}) {
  const studentCollaborators = collaborators.filter(c => c.type === 'STUDENT');
  const academicCollaborators = collaborators.filter(
    c => c.type === 'ACADEMIC',
  );

  // Build the slider items server-side so the orientation flag (only
  // available on the raw media value) crosses the RSC boundary alongside
  // the rendered MediaContent node. Image entries are treated as horizontal
  // so they keep the existing one-per-slide behavior.
  const sliderItems: SliderItem[] = media.map((value, i) => ({
    orientation: value.type === 'mp4' ? value.orientation : 'horizontal',
    node: <MediaContent value={value} key={i} />,
  }));

  return (
    <div
      id={id}
      className="grid grid-rows-[min-content_1fr] xl:grid-cols-[3fr_7fr] gap-10 align-center mt-10 scroll-mt-below-header"
    >
      <div>
        <TextContent className="mb-3" desired={{ size: '2xl' }} value={name} />
        {studentCollaborators.length > 0 && (
          <p>
            Student Collaborators:{' '}
            {studentCollaborators.map(({ name }, i) => (
              <Fragment key={i}>
                <TextContent value={name} desired={{ tag: 'span' }} />
                {i < studentCollaborators.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}
        {academicCollaborators.length > 0 && (
          <p>
            Academic Collaborators:{' '}
            {academicCollaborators.map(({ name }, i) => (
              <Fragment key={i}>
                <TextContent value={name} desired={{ tag: 'span' }} />
                {i < academicCollaborators.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}
      </div>
      <Slider items={sliderItems} />
    </div>
  );
}
