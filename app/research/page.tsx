import type { Metadata } from 'next';
import { retrieveMetadata } from '@/utils/metadata';
import { retrieveData } from '@/utils/research';
import { Fragment } from 'react';
import { TextContent } from '@/components/text-content';
import Link from 'next/link';
import { AnyContent } from '@/components/any-content';

export async function generateMetadata(): Promise<Metadata> {
  return retrieveMetadata('research');
}

export default async function Research() {
  const { topics } = await retrieveData();

  return (
    <main>
      <div className="mx-[8%] my-10 flex flex-col gap-8">
        {topics.map(({ name }, i) => (
          <Fragment key={i}>
            <section className="grid grid-rows-[auto_min-content] grid-cols-[7fr_auto_3fr]">
              <div className="col-span-3 mb-5">
                <TextContent
                  value={name}
                  desired={{ size: '5xl', tag: 'h2' }}
                />
              </div>
              <div className="mx-8 my-4">
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <AnyContent
                      key={i}
                      value={{
                        type: 'text',
                        underline: false,
                        bold: false,
                        italic: false,
                        align: 'left',
                        whitespace: 'normal',
                        tag: 'p',
                        size: 'base',
                        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod leo urna, nec auctor est interdum ac. Ut consectetur enim sit amet dolor sollicitudin vestibulum. Pellentesque tincidunt, augue non pharetra lobortis, nisi est fringilla libero, vitae sodales dolor augue eu magna. Donec id lorem at metus eleifend sodales et sit amet elit. Proin elit leo, dictum sagittis libero vel, dictum pretium tortor. Aliquam id semper quam. Curabitur sodales ligula at lorem feugiat, id varius metus egestas.',
                      }}
                    />
                  ))}
                {Array(1)
                  .fill(0)
                  .map((_, i) => (
                    <AnyContent
                      key={i}
                      value={{
                        type: 'image',
                        filename: 'courses/demo.png',
                        alt: 'demo',
                      }}
                    />
                  ))}
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <AnyContent
                      key={i}
                      value={{
                        type: 'text',
                        underline: false,
                        bold: false,
                        italic: false,
                        align: 'left',
                        whitespace: 'normal',
                        tag: 'p',
                        size: 'base',
                        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod leo urna, nec auctor est interdum ac. Ut consectetur enim sit amet dolor sollicitudin vestibulum. Pellentesque tincidunt, augue non pharetra lobortis, nisi est fringilla libero, vitae sodales dolor augue eu magna. Donec id lorem at metus eleifend sodales et sit amet elit. Proin elit leo, dictum sagittis libero vel, dictum pretium tortor. Aliquam id semper quam. Curabitur sodales ligula at lorem feugiat, id varius metus egestas.',
                      }}
                    />
                  ))}
              </div>
              <div className="h-full w-px bg-graphite dark:bg-whisper-gray" />
              <div className="my-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div className="px-10 my-6" key={i}>
                      <Link
                        href="/courses/test.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <TextContent
                          value="Really Scientific Sounding Paper Name, AI, ML, MD, PhD"
                          desired={{ bold: true, underline: true }}
                        />
                      </Link>
                      {['Student One', 'Student Two', 'Academic One'].map(
                        (name, i, arr) => (
                          <Fragment key={i}>
                            <TextContent
                              value={name}
                              desired={{ italic: true, tag: 'span' }}
                            />
                            {i < arr.length - 1 && ', '}
                          </Fragment>
                        ),
                      )}
                    </div>
                  ))}
              </div>
            </section>
            {i < topics.length - 1 && (
              <hr className="my-4 border-graphite dark:border-whisper-gray" />
            )}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
