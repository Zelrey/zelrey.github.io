import { defineType, defineField } from 'sanity'

export const artworkType = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Artwork Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order / Priority',
      type: 'number',
      description: 'Used for ordering artworks in the gallery (1, 2, 3...)',
      initialValue: 1,
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (MP4)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Artwork Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.mediaType === 'video',
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File (MP4)',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'spanTwoColumns',
      title: 'Feature Tile (Span 2 Columns in Art)',
      type: 'boolean',
      description: 'Check this if this artwork or video should occupy 2 columns',
      initialValue: false,
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
      media: 'image',
      mediaType: 'mediaType',
    },
    prepare({ title, media, mediaType }) {
      return {
        title: title || 'Untitled Artwork',
        subtitle: mediaType === 'video' ? '🎬 Looping Video' : '🖼️ Image Artwork',
        media: media,
      }
    },
  },
})
