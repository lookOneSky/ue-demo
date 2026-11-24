<script setup lang="ts">
const shapes = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  palette: 'M4 3h6v15a3 3 0 0 1-6 0z M11 9l4-4 4 4-8 8 M13 15h8v6H7 M7 17v1',
  sliders: 'M3 6h5 M12 6h9 M3 12h11 M18 12h3 M3 18h2 M9 18h12 M8 3v6 M14 9v6 M6 15v6',
  cube: 'm12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10',
  expand: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M16 21h5v-5',
  restore: 'M3 8h5V3 M21 8h-5V3 M8 21v-5H3 M21 16h-5v5',
  reset: 'M3 4v6h6 M4 10a8 8 0 1 1 1 8',
  chevron: 'm9 6 6 6-6 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  book: 'M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z M12 6v15',
}
defineProps<{ name: keyof typeof shapes }>()
</script>
<template>
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path :d="shapes[name]" /></svg>
</template>
