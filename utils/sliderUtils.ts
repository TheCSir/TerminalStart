export const calculateSliderValue = (
    clientX: number,
    rectLeft: number,
    rectWidth: number,
    min: number,
    max: number,
    step: number
): number => {
    const x = clientX - rectLeft;
    const pct = Math.max(0, Math.min(1, x / rectWidth));
    const raw = min + pct * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, snapped));
};

export const calculateStepChange = (
    currentValue: number,
    step: number,
    min: number,
    max: number,
    key: string
): number => {
    let newVal = currentValue;
    if (key === 'ArrowRight' || key === 'ArrowUp') {
        newVal = Math.min(max, currentValue + step);
    } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
        newVal = Math.max(min, currentValue - step);
    }
    return newVal;
};
