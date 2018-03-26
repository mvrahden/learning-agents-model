import { Point2D } from './Point2D';

export class GeoMath {
  /**
   * Determines if Line (p1,p2) intersects with Line (p3,p4).
   * Returns either `null` or relative proximity. 
   * @param p1 
   * @param p2 
   * @param p3 
   * @param p4 
   * @returns relative Proximity or null
   */
  public static lineIntersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): null | number {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0.0) { return null; } // parallel lines

    const relativeProximityA = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const relativeProximityB = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

    if (relativeProximityA > 0.0 && relativeProximityA <= 1.0 && relativeProximityB > 0.0 && relativeProximityB <= 1.0) {
      return relativeProximityA;
    }
    return null;
  }

  /**
   * Determines the perpendicular distance between Line (p1,p2) and p0.
   * @param p1 central point, relative to (0,0)
   * @param p2 end of line, relative to (0,0)
   * @param p0 point relative to (0,0)
   * @returns orthogonal distance
   */
  public static linePointOrthogonalDistance(p1: Point2D, p2: Point2D, p0: Point2D): number {
    const p1p2Length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const boundingBox = Math.abs(
      ((p2.y - p1.y) * p0.x) - ((p2.x - p1.x) * p0.y) + (p2.x * p1.y) - (p2.y * p1.x));
    const orthogonalDistance = boundingBox / p1p2Length;
    return orthogonalDistance;
  }

  /**
   * Proximity by scalar projection (Orthogonal)
   * @param p1 Point on Line
   * @param p2 Point on Line
   * @param p0 Point of interest
   */
  public static absoluteLinePointProjectionProximity(p1: Point2D, p2: Point2D, p0: Point2D): number {
    const reducedP1P0 = p1.sub(p0); // (P1|P0)
    const reducedP1P2 = p1.sub(p2); // (P1|P2)

    const phi = reducedP1P2.angle(reducedP1P0); // angle between (P1|P2) -> (P1|P0)

    const proximity = reducedP1P0.length() * Math.cos(phi);
    return proximity;
  }

  public static relativeLinePointProximity(p1: Point2D, p2: Point2D, p3: Point2D, rad: number): number {
    const perpendicularVec = new Point2D(-(p2.y - p1.y), p2.x - p1.x);  // counterwise rotation
    let d = Math.abs(
      (p2.x - p1.x) * (p1.y - p3.y) // rectangle    (P1|P2)x -> (P1|P3)y
      - (p1.x - p3.x) * (p2.y - p1.y) // rectangle  (P1|P3)x -> (P1|P2)y
    );
    d = d / perpendicularVec.length();

    if (d > rad) { return null; }

    perpendicularVec.normalize();
    perpendicularVec.scale(d);

    const intersectionPoint = p3.add(perpendicularVec);
    let relativeDistance = null;

    if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
      relativeDistance = (intersectionPoint.x - p1.x) / (p2.x - p1.x);
    } else {
      relativeDistance = (intersectionPoint.y - p1.y) / (p2.y - p1.y);
    }

    if (relativeDistance > 0.0 && relativeDistance < 1.0) { return relativeDistance; }
    return null;
  }

  public static pointToPointDistance(p1: Point2D, p2: Point2D): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
}
