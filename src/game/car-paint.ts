// Applies a garage CarCustom to a loaded car (garage viewer and race car).
// Matching materials are cloned first so the shared model cache is never mutated.
import * as THREE from "three";
import type { PlayerCar } from "./player-cars";
import { CAR_PARTS, effectiveColor, finishParams, type CarCustom, type CarPart } from "./car-custom";

/** Material names per paintable part, as they appear in each car's GLB. */
export const PART_MATERIALS: Record<PlayerCar, Record<CarPart, RegExp>> = {
  revuelto: {
    body: /^Body$/,
    seats: /^Interior_color$/,
    rims: /^material$/,
    calipers: /^Caliper$/,
  },
  chiron: {
    body: /^ChironMI_1245063001_014$|^ChironMI_Cabin1$/,
    seats: /^ChironMI_Cabin_Leather_A1$|^ChironMI_Cabin_Suede_A1$/,
    rims: /^ChironMI_Rim1$/,
    calipers: /^Chironcaliper_B$/,
  },
};

export function partOfMaterial(car: PlayerCar, name: string): CarPart | null {
  for (const part of CAR_PARTS) if (PART_MATERIALS[car][part].test(name)) return part;
  return null;
}

let weave: THREE.CanvasTexture | null = null;
/** Small procedural 2x2 twill pattern, shared by every carbon part. */
function carbonWeave(): THREE.CanvasTexture {
  if (weave) return weave;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const cell = size / 8;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const along = ((x + y) >> 1) % 2 === 0;
      const grad = along ? g.createLinearGradient(x * cell, 0, (x + 1) * cell, 0) : g.createLinearGradient(0, y * cell, 0, (y + 1) * cell);
      grad.addColorStop(0, "#5a5a5a");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(1, "#5a5a5a");
      g.fillStyle = grad;
      g.fillRect(x * cell, y * cell, cell, cell);
    }
  weave = new THREE.CanvasTexture(c);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(24, 24);
  weave.colorSpace = THREE.SRGBColorSpace;
  weave.anisotropy = 4;
  return weave;
}

type Factory = { color: THREE.Color; map: THREE.Texture | null; metalness: number; roughness: number; clearcoat: number };

/**
 * Paint the car. Safe to call repeatedly: originals are remembered on the
 * mesh so "factory" restores the model's own look.
 */
export function applyCarCustom(root: THREE.Object3D, car: PlayerCar, custom: CarCustom) {
  const cloned = new Map<THREE.Material, THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const original = (mesh.userData["paintSource"] as THREE.MeshStandardMaterial | undefined) ?? (mesh.material as THREE.MeshStandardMaterial);
    if (!original?.isMeshStandardMaterial) return;
    const part = partOfMaterial(car, original.name);
    if (!part) return;
    const style = custom[part];
    const factory = !style.color && !style.finish;
    if (factory) {
      if (mesh.userData["paintSource"]) mesh.material = original;
      return;
    }
    mesh.userData["paintSource"] = original;
    let mat = cloned.get(original) as THREE.MeshStandardMaterial | undefined;
    if (!mat) {
      mat = original.clone();
      const base: Factory = { color: original.color.clone(), map: original.map, metalness: original.metalness, roughness: original.roughness, clearcoat: (original as THREE.MeshPhysicalMaterial).clearcoat ?? 0 };
      const color = effectiveColor(style);
      if (color) {
        mat.color.set(color);
        mat.map = null; // flat paint replaces the factory texture's colour
      } else {
        mat.color.copy(base.color);
      }
      if (style.finish) {
        const f = finishParams(style.finish);
        mat.metalness = f.metalness;
        mat.roughness = f.roughness;
        if ((mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) (mat as THREE.MeshPhysicalMaterial).clearcoat = f.clearcoat;
        if (f.weave) {
          mat.map = carbonWeave();
          mat.roughnessMap = null;
        }
      }
      mat.needsUpdate = true;
      cloned.set(original, mat);
    }
    mesh.material = mat;
  });
}
