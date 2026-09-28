export type EmojiSelection =
    | {kind: 'unicode'; id: string; native: string}
    | {kind: 'custom'; id: string};
