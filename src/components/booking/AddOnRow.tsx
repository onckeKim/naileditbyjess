"use client";

import { calculateAddOnPrice, formatRand } from "@/lib/pricing";
import type { ServiceOption, AddOnSelectionState } from "./types";

export function AddOnRow({
  service,
  state,
  onChange,
}: {
  service: ServiceOption;
  state: AddOnSelectionState;
  onChange: (next: AddOnSelectionState) => void;
}) {
  const result = state.selected ? calculateAddOnPrice(service, state) : null;
  const type = service.pricingType;

  return (
    <div className={`border rounded-lg p-4 transition-colors ${state.selected ? "border-black bg-white" : "border-marble bg-white/60"}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={state.selected}
          onChange={(e) => onChange({ ...state, selected: e.target.checked })}
          className="mt-1 h-4 w-4 accent-black"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg text-black">{service.name}</p>
              {service.description && <p className="text-sm text-medium-grey mt-0.5">{service.description}</p>}
            </div>
            {result && <p className="font-display text-black whitespace-nowrap">{formatRand(result.price)}{result.isEstimate ? " est." : ""}</p>}
          </div>
        </div>
      </label>

      {state.selected && (
        <div className="mt-3 pl-7 flex flex-wrap items-center gap-3">
          {type === "PER_NAIL_OR_FULL_SET" && (
            <div className="inline-flex rounded-sm border border-black overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => onChange({ ...state, mode: "FULL_SET" })}
                className={`px-3 py-1.5 ${state.mode === "FULL_SET" ? "bg-black text-white" : "bg-white text-black"}`}
              >
                Full Set
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, mode: "PER_NAIL" })}
                className={`px-3 py-1.5 border-l border-black ${state.mode === "PER_NAIL" ? "bg-black text-white" : "bg-white text-black"}`}
              >
                Per Nail
              </button>
            </div>
          )}

          {(type === "PER_NAIL" || type === "PER_NAIL_RANGE" || (type === "PER_NAIL_OR_FULL_SET" && state.mode === "PER_NAIL")) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-medium-grey">Nails:</span>
              <div className="inline-flex items-center border border-marble rounded-sm">
                <button
                  type="button"
                  onClick={() => onChange({ ...state, nailCount: Math.max(1, state.nailCount - 1) })}
                  className="w-8 h-8 text-black hover:bg-bg"
                  aria-label="Decrease nail count"
                >
                  –
                </button>
                <span className="w-8 text-center text-sm">{state.nailCount}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...state, nailCount: Math.min(10, state.nailCount + 1) })}
                  className="w-8 h-8 text-black hover:bg-bg"
                  aria-label="Increase nail count"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {result && <span className="text-xs text-medium-grey">{result.detail}</span>}
        </div>
      )}
    </div>
  );
}
