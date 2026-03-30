import {
  budgetRangeOptions,
  campaignTypeOptions,
  channelOptions,
  objectiveOptions,
  toneOptions
} from "@/lib/briefloop";

const channelValues = new Set(channelOptions.map((option) => option.value));
const objectiveValues = new Set(objectiveOptions.map((option) => option.value));
const budgetRangeValues = new Set(budgetRangeOptions.map((option) => option.value));
const campaignTypeValues = new Set(campaignTypeOptions.map((option) => option.value));
const toneValues = new Set(toneOptions.map((option) => option.value));

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export function getRequiredString(value: unknown, fieldLabel: string, maxLength: number) {
  const normalized = cleanString(value, maxLength);

  if (!normalized) {
    throw new RequestValidationError(`${fieldLabel} é obrigatório.`);
  }

  return normalized;
}

export function getOptionalString(value: unknown, maxLength: number) {
  const normalized = cleanString(value, maxLength);
  return normalized || null;
}

export function getOptionalFiniteNumber(value: unknown, fieldLabel: string) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
    throw new RequestValidationError(`${fieldLabel} precisa ser um número válido.`);
  }

  return value;
}

export function getStringArray(value: unknown, maxItems: number, maxItemLength: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function assertChannel(value: string) {
  if (!channelValues.has(value as (typeof channelOptions)[number]["value"])) {
    throw new RequestValidationError("Canal inválido.");
  }
}

export function assertObjective(value: string) {
  if (!objectiveValues.has(value as (typeof objectiveOptions)[number]["value"])) {
    throw new RequestValidationError("Objetivo inválido.");
  }
}

export function assertBudgetRange(value: string | null) {
  if (value && !budgetRangeValues.has(value as (typeof budgetRangeOptions)[number]["value"])) {
    throw new RequestValidationError("Faixa de budget inválida.");
  }
}

export function assertCampaignType(value: string) {
  if (!campaignTypeValues.has(value as (typeof campaignTypeOptions)[number]["value"])) {
    throw new RequestValidationError("Tipo de campanha inválido.");
  }
}

export function assertTone(value: string) {
  if (!toneValues.has(value as (typeof toneOptions)[number]["value"])) {
    throw new RequestValidationError("Tom de voz inválido.");
  }
}
