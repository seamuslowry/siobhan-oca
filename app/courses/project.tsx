import Slider from '@/components/slider';
import { Fragment } from 'react';
import { type Project as ProjectType } from '@/utils/courses';
import { TextContent } from '@/components/text-content';
import MediaContent from '@/components/media-content';

export async function Project({
  project: { name, collaborators, media, description },
}: {
  project: ProjectType;
}) {
  const studentCollaborators = collaborators.filter(c => c.type === 'STUDENT');
  const academicCollaborators = collaborators.filter(
    c => c.type === 'ACADEMIC',
  );

  return (
    <div className="grid grid-rows-[min-content_1fr] xl:grid-cols-[3fr_7fr] gap-10 align-center mt-10">
      <div>
        <TextContent className="mb-3" desired={{ size: '2xl' }} value={name} />
        {studentCollaborators.length > 0 && (
          <p>
            Student Collaborators:{' '}
            {studentCollaborators.map(({ name }, i) => (
              <Fragment key={i}>
                <TextContent
                  value={name}
                  desired={{ italic: true, tag: 'span' }}
                />
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
                <TextContent
                  value={name}
                  desired={{ italic: true, tag: 'span' }}
                />
                {i < academicCollaborators.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}
        <div className="mt-4">
          {description.map((piece, index) => (
            <TextContent key={index} value={piece} />
          ))}
        </div>
      </div>
      <Slider>
        {media.map(async (value, i) => (
          <MediaContent value={value} key={i} />
        ))}
      </Slider>
    </div>
  );
}
