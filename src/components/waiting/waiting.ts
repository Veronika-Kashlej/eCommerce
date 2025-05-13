import './waiting.css';

class Waiting {
  private static instance: Waiting | undefined;
  private loader: HTMLDialogElement;

  private constructor(symbol: string) {
    this.loader = document.createElement('dialog');
    this.loader.textContent = symbol;
    this.loader.classList.add('waiting');
  }

  public static getInstance(symbol: string): Waiting {
    if (!Waiting.instance) {
      Waiting.instance = new Waiting(symbol);
    }
    return Waiting.instance;
  }

  public show() {
    if (this.loader) {
      document.body.append(this.loader);
      this.loader.showModal();
    }
  }

  public remove() {
    if (this.loader) {
      this.loader.close();
      this.loader.remove();
    }
  }

  public static destroy(): void {
    if (Waiting.instance) {
      Waiting.instance.loader.remove();
      Waiting.instance.remove();
      Waiting.instance = undefined;
    }
  }
}

const waiting = (symbol: string = '⏳'): Waiting => {
  return Waiting.getInstance(symbol);
};
export default waiting;
