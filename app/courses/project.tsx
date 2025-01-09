import Slider from '@/components/slider';

export interface Project {
  name?: string;
  collaborators?: { type?: 'STUDENT' | 'ACADEMIC'; name?: string }[];
}

export async function Project({
  project: { name = '', collaborators = [] },
}: {
  project: Project;
}) {
  const studentCollaborators = collaborators.filter(c => c.type === 'STUDENT');
  const academicCollaborators = collaborators.filter(
    c => c.type === 'ACADEMIC',
  );

  return (
    <div className="grid grid-rows-2 sm:grid-cols-2 lg:grid-cols-[3fr_7fr] gap-10 align-center mt-10">
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
        {['test1', 'test2', 'test3', 'test4'].map(t => (
          <p key={t}>{t}</p>
        ))}
      </Slider>
    </div>
  );
}
