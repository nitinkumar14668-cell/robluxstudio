import { RobloxInstance, OutputLog } from '../types/roblox';

export interface ScriptExecutionContext {
  instance: RobloxInstance;
  onLog: (log: Omit<OutputLog, 'id' | 'timestamp'>) => void;
  onModifyInstance: (id: string, updates: Partial<RobloxInstance>) => void;
  onDamagePlayer?: (amount: number) => void;
  onAwardCoins?: (coins: number) => void;
  playerPos?: { x: number; y: number; z: number };
}

export class RobloxScriptRunner {
  private activeIntervals: number[] = [];

  stopAll() {
    this.activeIntervals.forEach(clearInterval);
    this.activeIntervals = [];
  }

  runScript(scriptCode: string, ctx: ScriptExecutionContext) {
    if (!scriptCode || !scriptCode.trim()) return;

    ctx.onLog({
      type: 'info',
      text: `[Script:${ctx.instance.name}] Running script...`,
    });

    const code = scriptCode;

    // Detect patterns:
    // 1. Spinning rotor / rotator: while true do script.Parent.Rotation...
    if (code.includes('Rotation') && (code.includes('while') || code.includes('loop') || code.includes('spin'))) {
      const interval = window.setInterval(() => {
        const currentRotY = ctx.instance.rotation.y || 0;
        ctx.onModifyInstance(ctx.instance.id, {
          rotation: {
            ...ctx.instance.rotation,
            y: (currentRotY + 2) % 360,
          },
        });
      }, 30);
      this.activeIntervals.push(interval);
      ctx.onLog({
        type: 'print',
        text: `Spin loop started on ${ctx.instance.name}`,
      });
    }

    // 2. Disappearing / fading block:
    if (code.includes('Transparency') && (code.includes('wait') || code.includes('fade'))) {
      let fadingOut = true;
      let alpha = ctx.instance.transparency || 0;
      const interval = window.setInterval(() => {
        if (fadingOut) {
          alpha += 0.05;
          if (alpha >= 0.95) {
            alpha = 1;
            fadingOut = false;
            ctx.onModifyInstance(ctx.instance.id, { transparency: 1, canCollide: false });
          } else {
            ctx.onModifyInstance(ctx.instance.id, { transparency: alpha });
          }
        } else {
          alpha -= 0.05;
          if (alpha <= 0.05) {
            alpha = 0;
            fadingOut = true;
            ctx.onModifyInstance(ctx.instance.id, { transparency: 0, canCollide: true });
          } else {
            ctx.onModifyInstance(ctx.instance.id, { transparency: alpha });
          }
        }
      }, 100);
      this.activeIntervals.push(interval);
    }

    // 3. Rainbow color cycle
    if (code.includes('Color') && (code.includes('Rainbow') || code.includes('math.sin') || code.includes('HSV'))) {
      let hue = 0;
      const interval = window.setInterval(() => {
        hue = (hue + 2) % 360;
        const colorHex = `hsl(${hue}, 85%, 55%)`;
        ctx.onModifyInstance(ctx.instance.id, { color: colorHex });
      }, 50);
      this.activeIntervals.push(interval);
    }

    // 4. Print statements
    const printMatches = code.matchAll(/print\((['"])(.*?)\1\)/g);
    for (const match of printMatches) {
      ctx.onLog({
        type: 'print',
        text: match[2],
      });
    }

    // 5. Touched event handling: Touched:Connect(...)
    if (code.includes('Touched:Connect') || code.includes('Touched')) {
      if (code.includes('Health = 0') || code.includes('TakeDamage') || code.includes('Lava')) {
        ctx.onModifyInstance(ctx.instance.id, { isLava: true });
        ctx.onLog({
          type: 'info',
          text: `Enabled Touched kill event for ${ctx.instance.name}`,
        });
      }
      if (code.includes('Leaderstats') || code.includes('Coins') || code.includes('Point')) {
        ctx.onModifyInstance(ctx.instance.id, { isCoin: true, coinValue: 25 });
        ctx.onLog({
          type: 'info',
          text: `Bound Coin reward event for ${ctx.instance.name}`,
        });
      }
    }
  }
}

export const scriptRunner = new RobloxScriptRunner();
