---
title: API reference
layout: page
sidebar: false
aside: false
editLink: false
lastUpdated: false
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="api-bar">
  <span>REST API reference, generated from the OpenAPI spec.</span>
  <a :href="withBase('/api/openapi.yaml')" download="openapi.yaml" target="_self">Download openapi.yaml</a>
</div>

<iframe class="api-frame" :src="withBase('/api/redoc.html')" title="Project Node API reference"></iframe>

<style>
.api-bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.9rem;
}
.api-bar a {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
.api-frame {
  display: block;
  width: 100%;
  height: calc(100vh - var(--vp-nav-height) - 3rem);
  border: 0;
}
</style>
