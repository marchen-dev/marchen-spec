import { intro, outro } from '@clack/prompts'

export function showIntro(): void {
  intro('MarchenSpec CLI')
}

export function showOutro(message: string): void {
  outro(message)
}
