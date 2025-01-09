import Image from 'next/image';
import Slider from '@/components/slider';
import { Fragment } from 'react';

export interface Project {
  name?: string;
  collaborators?: { type?: 'STUDENT' | 'ACADEMIC'; name?: string }[];
  media?: { type?: 'mp4' | 'image'; location?: string; alt?: string }[];
}

export async function Project({
  project: { name = '', collaborators = [], media = [] },
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
        <p className="text-2xl mb-3">{name}</p>
        {studentCollaborators.length > 0 && (
          <p>
            Student Collaborators:{' '}
            {studentCollaborators.map(sc => sc.name).join(', ')}
          </p>
        )}
        {academicCollaborators.length > 0 && (
          <p>
            Academic Collaborators:{' '}
            {academicCollaborators.map(sc => sc.name).join(', ')}
          </p>
        )}
      </div>
      <Slider>
        {media.map(async ({ type, location = '', alt = '' }, i) => (
          <Fragment key={i}>
            {type === 'mp4' && (
              <video
                controls
                preload="metadata"
                className="w-full aspect-video"
              >
                <source src={`/courses/${location}`} type="video/mp4" />
                {alt ?? 'Your browser does not support the video tag.'}
              </video>
            )}
            {type === 'image' && (
              <Image
                src={(await import(`@/assets/courses/${location}`)).default}
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
