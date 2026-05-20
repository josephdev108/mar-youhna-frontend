export const emptyTopic = () => ({ name: '', image_url: null, imageFile: null, remove_image: false })
export const emptySubtopic = () => ({ title: '' })
export const emptyConference = () => ({
  title: '',
  image_url: null,
  imageFile: null,
  remove_image: false,
  subtopics: [emptySubtopic()],
})
export const emptyPoint = () => ({ content: '' })
export const emptyRetreat = () => ({ name: '', points: [emptyPoint()] })
export const emptyProgramLecture = () => ({ name: '', date: '', notes: '' })

export function programFromApi(p) {
  return {
    year: p.year,
    slogan: p.slogan ?? '',
    verse: p.verse ?? '',
    topics: (p.topics ?? []).map((t) => ({ ...t, imageFile: null, remove_image: false })),
    conferences: (p.conferences ?? []).map((c) => ({
      ...c,
      imageFile: null,
      remove_image: false,
      subtopics: c.subtopics?.length ? [...c.subtopics] : [],
    })),
    retreats: (p.retreats ?? []).map((r) => ({
      ...r,
      points: r.points?.length ? [...r.points] : [],
    })),
    program_lectures: (p.program_lectures ?? []).map((l) => ({
      ...l,
      date: l.date ?? '',
      notes: l.notes ?? '',
    })),
  }
}

export function buildFormData(payload, topicFiles, conferenceFiles) {
  const fd = new FormData()
  fd.append('year', String(payload.year))
  fd.append('slogan', payload.slogan ?? '')
  fd.append('verse', payload.verse ?? '')

  payload.topics.forEach((t, i) => {
    if (t.id) fd.append(`topics[${i}][id]`, t.id)
    fd.append(`topics[${i}][name]`, t.name)
    if (t.remove_image) fd.append(`topics[${i}][remove_image]`, '1')
    if (topicFiles[i]) fd.append(`topic_images[${i}]`, topicFiles[i])
  })

  payload.conferences.forEach((c, i) => {
    if (c.id) fd.append(`conferences[${i}][id]`, c.id)
    fd.append(`conferences[${i}][title]`, c.title)
    if (c.remove_image) fd.append(`conferences[${i}][remove_image]`, '1')
    if (conferenceFiles[i]) fd.append(`conference_images[${i}]`, conferenceFiles[i])
    ;(c.subtopics ?? []).forEach((s, j) => {
      if (s.id) fd.append(`conferences[${i}][subtopics][${j}][id]`, s.id)
      fd.append(`conferences[${i}][subtopics][${j}][title]`, s.title)
    })
  })

  payload.retreats.forEach((r, i) => {
    if (r.id) fd.append(`retreats[${i}][id]`, r.id)
    fd.append(`retreats[${i}][name]`, r.name)
    ;(r.points ?? []).forEach((p, j) => {
      if (p.id) fd.append(`retreats[${i}][points][${j}][id]`, p.id)
      fd.append(`retreats[${i}][points][${j}][content]`, p.content)
    })
  })

  ;(payload.program_lectures ?? []).forEach((l, i) => {
    if (l.id) fd.append(`program_lectures[${i}][id]`, l.id)
    fd.append(`program_lectures[${i}][name]`, l.name)
    if (l.date) fd.append(`program_lectures[${i}][date]`, l.date)
    if (l.notes?.trim()) fd.append(`program_lectures[${i}][notes]`, l.notes.trim())
  })

  return fd
}

export function prepareSavePayload(form) {
  const topics = form.topics.filter((t) => t.name?.trim())
  const conferences = form.conferences
    .filter((c) => c.title?.trim())
    .map((c) => ({
      ...c,
      subtopics: (c.subtopics ?? []).filter((s) => s.title?.trim()),
    }))
  const retreats = form.retreats
    .filter((r) => r.name?.trim())
    .map((r) => ({
      ...r,
      points: (r.points ?? []).filter((p) => p.content?.trim()),
    }))
  const program_lectures = form.program_lectures.filter((l) => l.name?.trim())

  if (!form.year) {
    return { error: 'أدخل السنة' }
  }

  return {
    payload: {
      year: Number(form.year),
      slogan: form.slogan?.trim() || null,
      verse: form.verse?.trim() || null,
      topics,
      conferences,
      retreats,
      program_lectures,
    },
    topicFiles: topics.map((t) => t.imageFile),
    conferenceFiles: conferences.map((c) => c.imageFile),
  }
}

export async function saveAnnualProgram(api, id, form) {
  const prepared = prepareSavePayload(form)
  if (prepared.error) {
    const err = new Error(prepared.error)
    err.validation = true
    throw err
  }
  const fd = buildFormData(prepared.payload, prepared.topicFiles, prepared.conferenceFiles)
  const { data } = await api.post(`/annual-programs/${id}`, fd)
  return data.data
}
