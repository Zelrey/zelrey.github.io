import { defineType, defineField } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title (e.g. JPARK SUITES)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discipline',
      title: 'Discipline / Category (e.g. 3D Layout & Photography)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Project Description / Story',
      type: 'text',
      rows: 3,
      description: 'Explain the concept, strategy, or design process.',
    }),
    defineField({
      name: 'spanTwoColumns',
      title: 'Occupy 2 Columns (Feature Tile)',
      type: 'boolean',
      description: 'Check to make this project feature wide tiles across 2 columns',
      initialValue: false,
    }),
    defineField({
      name: 'year',
      title: 'Year (e.g. 2026)',
      type: 'string',
      initialValue: '2026',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'images',
      title: 'Project Gallery Images (Drag and drop to reorder)',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text / Label',
              type: 'string',
            }),
          ],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Manual Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      discipline: 'discipline',
      year: 'year',
      media: 'images.0',
    },
    prepare({ title, discipline, year, media }) {
      return {
        title: title || 'Untitled Project',
        subtitle: `${discipline || ''} (${year || ''})`,
        media: media,
      }
    },
  },
})
