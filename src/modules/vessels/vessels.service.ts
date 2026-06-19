import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vessel } from './entities/vessel.entity';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { UpdateVesselDto } from './dto/update-vessel.dto';

@Injectable()
export class VesselsService {
  private readonly logger = new Logger(VesselsService.name);

  constructor(
    @InjectRepository(Vessel)
    private readonly vesselRepository: Repository<Vessel>,
  ) {}

  /**
   * Create a new vessel
   */
  async create(createVesselDto: CreateVesselDto): Promise<Vessel> {
    try {
      const vessel = this.vesselRepository.create(createVesselDto);
      const savedVessel = await this.vesselRepository.save(vessel);
      this.logger.log(`Vessel created: ${savedVessel.id} - ${savedVessel.name}`);
      return savedVessel;
    } catch (error) {
      this.logger.error(`Error creating vessel: ${error.message}`);
      if (error.code === '23505') {
        throw new BadRequestException('Vessel name or IMO number already exists');
      }
      throw error;
    }
  }

  /**
   * Get all vessels with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Vessel[]; total: number }> {
    const query = this.vesselRepository
      .createQueryBuilder('vessel')
      .where('vessel.is_deleted = :isDeleted', { isDeleted: false });

    const total = await query.getCount();
    const skip = (page - 1) * limit;

    const data = await query
      .orderBy('vessel.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return { data, total };
  }

  /**
   * Get vessel by ID
   */
  async findById(id: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    return vessel;
  }

  /**
   * Get vessel by name
   */
  async findByName(name: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { name, is_deleted: false },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with name ${name} not found`);
    }

    return vessel;
  }

  /**
   * Get vessel by IMO number
   */
  async findByImoNumber(imoNumber: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { imo_number: imoNumber, is_deleted: false },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with IMO ${imoNumber} not found`);
    }

    return vessel;
  }

  /**
   * Update vessel
   */
  async update(id: string, updateVesselDto: UpdateVesselDto): Promise<Vessel> {
    const vessel = await this.findById(id);

    Object.assign(vessel, updateVesselDto);
    const updatedVessel = await this.vesselRepository.save(vessel);

    this.logger.log(`Vessel updated: ${id}`);
    return updatedVessel;
  }

  /**
   * Soft delete vessel
   */
  async remove(id: string, deletedBy: string): Promise<Vessel> {
    const vessel = await this.findById(id);

    vessel.is_deleted = true;
    vessel.deleted_at = new Date();
    vessel.deleted_by = deletedBy;

    const deletedVessel = await this.vesselRepository.save(vessel);
    this.logger.log(`Vessel soft deleted: ${id}`);
    return deletedVessel;
  }

  /**
   * Restore soft-deleted vessel
   */
  async restore(id: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { id, is_deleted: true },
    });

    if (!vessel) {
      throw new NotFoundException(`Deleted vessel with ID ${id} not found`);
    }

    vessel.is_deleted = false;
    vessel.deleted_at = null;
    vessel.deleted_by = null;

    const restoredVessel = await this.vesselRepository.save(vessel);
    this.logger.log(`Vessel restored: ${id}`);
    return restoredVessel;
  }
}
