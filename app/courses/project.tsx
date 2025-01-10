import Image from 'next/image';
import Slider from '@/components/slider';
import { Fragment } from 'react';
import {
  type TextContent as TextContentType,
  TextContent,
} from '@/components/text-content';

export interface Project {
  name?: string;
  collaborators?: { type?: 'STUDENT' | 'ACADEMIC'; name?: string }[];
  media?: { type?: 'mp4' | 'image'; filename?: string; alt?: string }[];
  description?: TextContentType[];
}

export async function Project({
  project: { name = '', collaborators = [], media = [], description = [] },
}: {
  project: Project;
}) {
  const studentCollaborators = collaborators.filter(c => c.type === 'STUDENT');
  const academicCollaborators = collaborators.filter(
    c => c.type === 'ACADEMIC',
  );

  return (
    <div className="grid grid-rows-[min-content_1fr] sm:grid-cols-2 lg:grid-cols-[3fr_7fr] gap-10 align-center mt-10">
      <div>
        <TextContent desired={{ size: '2xl' }} value={name} />
        {studentCollaborators.length > 0 && (
          <p>
            Student Collaborators:{' '}
            {studentCollaborators.map((sc, i) => (
              <Fragment key={i}>
                <span className="italic">{sc.name}</span>
                {i < studentCollaborators.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}
        {academicCollaborators.length > 0 && (
          <p>
            Academic Collaborators:{' '}
            {academicCollaborators.map((sc, i) => (
              <Fragment key={i}>
                <span className="italic">{sc.name}</span>
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
        {media.map(async ({ type, filename = '', alt = '' }, i) => (
          <Fragment key={i}>
            {type === 'mp4' && (
              <video
                controls
                preload="metadata"
                className="w-full aspect-video"
              >
                <source src={`/courses/${filename}`} type="video/mp4" />
                {alt ?? 'Your browser does not support the video tag.'}
              </video>
            )}
            {type === 'image' && (
              <Image
                src={(await import(`@/assets/courses/${filename}`)).default}
                alt={alt}
                placeholder="blur"
                unoptimized
              />
            )}
          </Fragment>
        ))}
      </Slider>
    </div>
  );
}
