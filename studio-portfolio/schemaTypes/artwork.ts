import { defineType, defineField } from 'sanity'

export const artworkType = defineType({
  name: 'artwork',
  title: 'Artworks',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title / Caption',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Name of the artwork (e.g. Surreal Logos, Wings, Girl with Oranges)',
    }),
    defineField({
      name: 'order',
      title: 'Display Order / Priority',
      type: 'number',
      description: 'Lower numbers appear first (1, 2, 3...)',
      initialValue: 1,
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image Artwork', value: 'image' },
          { title: 'Looping Video (MP4)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Upload Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.mediaType === 'video',
    }),
    defineField({
      name: 'videoFile',
      title: 'Upload MP4 Video',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'spanTwoColumns',
      title: 'Feature Tile (Span 2 Columns in Gallery)',
      type: 'boolean',
      description: 'Turn this ON if you want this piece to occupy 2 columns',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Display Order (1, 2, 3...)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      mediaType: 'mediaType',
    },
    prepare({ title, media, mediaType }) {
      return {
        title: title || 'Untitled Artwork',
        subtitle: mediaType === 'video' ? '🎬 Looping Video' : '🖼️ Image',
        media: media,
      }
    },
  },
})
