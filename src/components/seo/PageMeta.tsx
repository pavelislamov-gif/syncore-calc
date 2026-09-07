import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonicalUrl, seoForPath } from '@/data/seo'

function setNamedMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setPropertyMeta(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/** Keeps title/description/canonical in sync on client-side navigations. */
export function PageMeta() {
  const { pathname } = useLocation()
  const seo = seoForPath(pathname)
  const canonical = canonicalUrl(seo.path)

  useEffect(() => {
    document.title = seo.title
    setNamedMeta('description', seo.description)
    setNamedMeta('robots', seo.robots ?? 'index,follow')
    setCanonical(canonical)
    setPropertyMeta('og:title', seo.title)
    setPropertyMeta('og:description', seo.description)
    setPropertyMeta('og:url', canonical)
  }, [seo.title, seo.description, seo.robots, canonical])

  return null
}
