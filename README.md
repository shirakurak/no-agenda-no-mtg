# no-agenda-no-mtg

**Promote better meetings, one agenda at a time.**

## 概要

Googleカレンダーで タイトルに `mtg` が含まれていて、説明欄が空の場合、説明欄に自動で `アジェンダはこちら:`を挿入する Chrome 拡張です。

**アジェンダのないミーティングをなくす**文化をつくるための、ほんの小さな仕組みです。

## 主な機能（開発予定）

- `mtg`（または設定したキーワード）をタイトルに含むイベントを検知
- 説明欄が空の場合、自動で文言（デフォルト：`アジェンダはこちら:`）を挿入
- 検知キーワード・挿入文言は自由に設定可能（オプション画面から変更）

## プライバシーについて

- 外部通信は一切行いません
- ユーザーデータ・予定内容の収集なし
- 権限は `https://calendar.google.com/*` のみ

## コントリビュート

提案・改善・翻訳など大歓迎です。
Pull Request / Issue からご連絡ください。

---

## Overview

**no-agenda-no-mtg** is a Chrome extension that helps you build a better meeting culture.
When you create a Google Calendar event with `mtg` in the title and no description,
it automatically inserts the text `アジェンダはこちら:` (`Agenda here:`) in the description field.

**Mission:**
> If a meeting has no agenda, it shouldn’t exist.

## Features

- Detects when the event title contains `mtg` (or any custom keyword you set)
- Automatically inserts your preferred text into the empty description field
- Keywords and inserted text are fully customizable via the options page

## 🔒 Privacy

- No external communication
- No data collection or tracking
- Runs only on `https://calendar.google.com/*`

## 🤝 Contributing

Pull requests and ideas are welcome.
Let’s spread the “No Agenda, No Meeting” culture together.
